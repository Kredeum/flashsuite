// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;


/**
    Ropsten instances:
    - Uniswap V2 Router:                    0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
    - Sushiswap V1 Router:                  No official sushi routers on testnet
    - DAI:                                  0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108
    - ETH:                                  0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    - Aave LendingPoolAddressesProvider:    0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728
    
    Mainnet instances:
    - Uniswap V2 Router:                    0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
    - Sushiswap V1 Router:                  0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F
    - DAI:                                  0x6B175474E89094C44Da98b954EedeAC495271d0F
    - ETH:                                  0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    - Aave LendingPoolAddressesProvider:    0x24a42fD28C976A61Df5D00D0599C34c4f90748c8
*/

import { FlashLoanReceiverBase } from "../aave/FlashLoanReceiverBase.sol";
import { ILendingPool, ILendingPoolAddressesProvider, IProtocolDataProvider, IStableDebtToken, IAToken } from "../aave/Interfaces.sol";
import { IERC20 } from "../interfaces/IERC20.sol";
import { SafeMath } from "../libraries/SafeMath.sol";
import {IUniswapV2Router02} from "../uniswap/IUniswapV2Router02.sol";

import "../libraries/Ownable.sol";

// We import this library to be able to use console.log
import "hardhat/console.sol";

contract FlashArb is FlashLoanReceiverBase, Ownable {

    event Swap1Complete(uint amountToTrade, uint256 amountReceived);

    address thisContract = address(this);
  
    using SafeMath for uint256;
    IUniswapV2Router02 uniswapV2Router;
    IUniswapV2Router02 sushiswapV1Router;
    uint deadline;
    IERC20 dai;
    address daiTokenAddress;
    uint256 amountToTrade;
    // uint256 tokensOut;
    
    /**
        Initialize deployment parameters
     */
    constructor(
        ILendingPoolAddressesProvider _addressProvider,
        IUniswapV2Router02 _uniswapV2Router, 
        IUniswapV2Router02 _sushiswapV1Router
        ) FlashLoanReceiverBase(_addressProvider) public {

            // instantiate SushiswapV1 and UniswapV2 Router02
            sushiswapV1Router = IUniswapV2Router02(address(_sushiswapV1Router));
            uniswapV2Router = IUniswapV2Router02(address(_uniswapV2Router));

            // setting deadline to avoid scenario where miners hang onto it and execute at a more profitable time
            deadline = block.timestamp + 300; // 5 minutes
    }
    
    /**
        Mid-flashloan logic i.e. what you do with the temporarily acquired flash liquidity
     */
   function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    )
        external
        override
        returns (bool)
    {
        console.log("executing operation");
        // Approve the LendingPool contract allowance to *pull* the owed amount
        uint amountOwing = amounts[0].add(premiums[0]);
        console.log("ETH amount owing: %s", amountOwing);

        // execute arbitrage strategy
        try this.executeArbitrage(amountOwing) {
        } catch Error(string memory) {
            // Reverted with a reason string provided
        } catch (bytes memory) {
            // failing assertion, division by zero.. blah blah
        }

        IERC20(assets[0]).approve(address(LENDING_POOL), amountOwing);

        return true;
    }

    /**
        The specific cross protocol swaps that makes up your arb strategy
        UniswapV2 -> SushiswapV1 example below
     */
    function executeArbitrage(uint amountOwing) public {

        // Trade 1: Execute swap of Ether into designated ERC20 token on UniswapV2
        try uniswapV2Router.swapETHForExactTokens{ 
            value: amountToTrade 
        }(
            amountToTrade, 
            getPathForETHToToken(daiTokenAddress), 
            address(this), 
            deadline
        ){
        } catch {
            // error handling when arb failed due to trade 1
        }
        // Re-checking prior to execution since the NodeJS bot that instantiated this contract would have checked already
        uint256 tokenAmountInWEI = dai.balanceOf(thisContract); //convert into Wei
        emit Swap1Complete(amountToTrade, tokenAmountInWEI);

        
        // uint256 estimatedETH = getEstimatedETHForToken(tokensOut, daiTokenAddress)[0]; // check how much ETH you'll get for x number of ERC20 token
        console.log("DAI received for 1st trade: %s", tokenAmountInWEI);
        // grant uniswap / sushiswap access to your token, DAI used since we're swapping DAI back into ETH
        dai.approve(address(uniswapV2Router), tokenAmountInWEI);
        dai.approve(address(sushiswapV1Router), tokenAmountInWEI);

        // Trade 2: Execute swap of the ERC20 token back into ETH on Sushiswap to complete the arb
        try sushiswapV1Router.swapExactTokensForETH (
            tokenAmountInWEI, 
            amountOwing, 
            getPathForTokenToETH(daiTokenAddress), 
            address(this), 
            deadline
        ){
        } catch {
            // error handling when arb failed due to trade 2    
        }
    }

    /**
        sweep entire balance on the arb contract back to contract owner
     */
    function WithdrawBalance() public payable onlyOwner {
        
        // withdraw all ETH
        msg.sender.call{ value: address(this).balance }("");
        
        // withdraw all x ERC20 tokens
        dai.transfer(msg.sender, dai.balanceOf(address(this)));
    }

    /**
        Flash loan x amount of wei's worth of `_flashAsset`
        e.g. 1 ether = 1000000000000000000 wei
     */
    function flashloan (
        address _flashAsset, 
        uint _flashAmount,
        address _daiTokenAddress,
        uint _amountToTrade) public onlyOwner {
            
        bytes memory params = "";
        uint16 referralCode = 0;

        daiTokenAddress = address(_daiTokenAddress);
        dai = IERC20(daiTokenAddress);
        
        address[] memory assets = new address[](1);
        assets[0] = _flashAsset;
        uint[] memory amounts = new uint[](1);
        amounts[0] = _flashAmount;

        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        amountToTrade = _amountToTrade; // how much wei you want to trade
        // tokensOut = _tokensOut; // how many tokens you want converted on the return trade     
        console.log("calling lending pool: %s", address(LENDING_POOL));
        console.log("this Contract: %s", thisContract);
        console.log("flashAmount: %s", _flashAmount);
        console.log("flashAsset: %s", _flashAsset);
        console.log("amountToTrade: %s", amountToTrade);
        

        
        try LENDING_POOL.flashLoan(
            thisContract,
            assets,
            amounts,
            modes,
            thisContract,
            params,
            referralCode
        ) {
        } catch Error(string memory) {
            // Reverted with a reason string provided
        } catch (bytes memory) {
            // failing assertion, division by zero.. blah blah
        }
        // call lending pool to commence flash loan
       
        
    }

    /**
        Using a WETH wrapper here since there are no direct ETH pairs in Uniswap v2
        and sushiswap v1 is based on uniswap v2
     */
    function getPathForETHToToken(address ERC20Token) private view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH();
        path[1] = ERC20Token;
    
        return path;
    }

    /**
        Using a WETH wrapper to convert ERC20 token back into ETH
     */
     function getPathForTokenToETH(address ERC20Token) private view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = ERC20Token;
        path[1] = sushiswapV1Router.WETH();
        
        return path;
    }

    /**
        helper function to check ERC20 to ETH conversion rate
     */
    function getEstimatedETHForToken(uint _tokenAmount, address ERC20Token) public view returns (uint[] memory) {
        return uniswapV2Router.getAmountsOut(_tokenAmount, getPathForTokenToETH(ERC20Token));
    }




   function ethBalance() public view returns(uint256) {
      uint256 ret = thisContract.balance;
      return ret;
    }

    function balance(address _asset) public view returns(uint256) {
      return IERC20(_asset).balanceOf(thisContract);
    }

    function rugPullERC(address _asset) public payable onlyOwner  {
      uint256 _amount = balance(_asset);
      if( _amount > 0)  {
        IERC20(_asset).transfer(msg.sender, _amount);
      }
    }

    // Withdraw all ETH and ERC20 tokens
    function rugPull(address[] calldata _assets, bool destruct) public payable onlyOwner {
      for (uint i = 0; i < _assets.length; i++) {
        rugPullERC(_assets[i]);
      }

      if (destruct) {
        selfdestruct(msg.sender);
      } else {
        // withdraw all ETH
        (bool success,) = msg.sender.call{ value: address(this).balance }("");
        require(success);
      }
    }
}
