// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

// https://github.com/aave/code-examples-protocol/tree/main/V2/Flash%20Loan%20-%20Batch

import { FlashLoanReceiverBase } from "./FlashLoanReceiverBase.sol";
import { ILendingPool, ILendingPoolAddressesProvider, IProtocolDataProvider, IStableDebtToken } from "./Interfaces.sol";
import { IERC20 } from "../interfaces/IERC20.sol";
import { SafeMath } from "../libraries/SafeMath.sol";

import "../libraries/Ownable.sol";

contract AaveTest2 is FlashLoanReceiverBase, Ownable {
    using SafeMath for uint256;

    address address1 = 0x981ab0D817710d8FFFC5693383C00D985A3BDa38;
    address address2 = 0xb09Ae31E045Bb9d8D74BB6624FeEB18B3Af72A8e;

    address DAI = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;
    address ADAI = 0xdCf0aF9e59C002FA3AA091a46196b37530FD48a8;
    address SDAI = 0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3;

    address USDT = 0x13512979ADE267AB5100878E2e0f485B568328a4;
    address AUSDT = 0xFF3c8bc103682FA918c954E84F5056aB4DD5189d;
    // address SUSDT = 0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3;

    uint256 flashDAI = 1001 ether;
    uint256 flashUSDT = 1002 ether;
    uint256 borrowUSDT = 503 ether;
    uint256 borrowDAI = 504 ether;

    event opExec(string desc, address indexed _from, address indexed _asset, uint256 _amount, uint256 _premium);

    IProtocolDataProvider constant dataProvider = IProtocolDataProvider(address(0x744C1aaA95232EeF8A9994C4E0b3a89659D9AB79));


    constructor(ILendingPoolAddressesProvider _addressProvider) FlashLoanReceiverBase(_addressProvider) public {
    }

    /**
      * This function is called after your contract has received the flash loaned amount
      *
      *   1. Get a flash loan of X DAI
      *   2. Deposit these X DAI onto the Aave V2 lending pool
      *
      *   3. Call some function using this X DAI
      *
      *   4. Withdraw X DAI from the Aave V2 lending pool
      *   5. Repay back flash loan X DAI + including fee 9bps
      *
      *   6. transfer back any token left in the contract, back to the owner
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
        emit opExec("opExec", msg.sender, assets[0], amounts[0], premiums[0]);

        someFunction1();

        // Approve the LendingPool contract allowance to *pull* the owed amount
        for (uint i = 0; i < assets.length; i++) {
            uint amountOwing = amounts[i].add(premiums[i]);
            IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
        }
        return true;
    }

    // OK
    function someFunction0() internal {
      deposit(DAI, flashDAI, address(this));
      withdraw(DAI, uint(-1), address(this));
    }
    // OK
    function someFunction1() internal {
      deposit(DAI, flashDAI, address(this));
      borrow(DAI, borrowDAI, address(this));
      repay(DAI, borrowDAI, address(this));
      withdraw(DAI, uint(-1), address(this));
    }
    // KO
    function someFunction2() internal {
      deposit(DAI, flashDAI, address(this));
      borrow(DAI, borrowDAI, msg.sender);
      repay(DAI, borrowDAI, msg.sender);
      withdraw(DAI, uint(-1), address(this));
    }


    function deposit(address _asset, uint256 _amount, address _onBehalfOf) internal {
      IERC20(_asset).approve(address(LENDING_POOL), _amount);
      LENDING_POOL.deposit(_asset, _amount, _onBehalfOf, 0);
    }
    function withdraw(address _asset, uint256 _amount, address _onBehalfOf) internal {
        // (address _aasset,,) = dataProvider.getReserveTokensAddresses(_asset);
        // uint256 assetBalance = IERC20(_aasset).balanceOf(address(this));
        LENDING_POOL.withdraw(_asset,  _amount, _onBehalfOf);
    }

    function approveBorrower(address _asset, uint256 _amount, address _onBehalfOf ) public {
        (, address __sasset,) = dataProvider.getReserveTokensAddresses(_asset);
        IStableDebtToken(__sasset).approveDelegation(_onBehalfOf, _amount);
    }
    function borrow(address _asset, uint256 _amount, address _onBehalfOf) internal {
        if ( _onBehalfOf != address(this) ){
          approveBorrower(_asset, _amount, _onBehalfOf);
        }
        LENDING_POOL.borrow(_asset, _amount, 1, 0, _onBehalfOf);
    }
    function repay(address _asset, uint256 _amount, address _onBehalfOf) internal {
        if ( _onBehalfOf != address(this) ){
          IERC20(_asset).transferFrom(msg.sender, address(this), _amount);
        }
        IERC20(_asset).approve(address(LENDING_POOL), _amount);
        LENDING_POOL.repay(_asset, _amount, 1, _onBehalfOf);
    }



    function myFlashLoanCall() public onlyOwner {

        uint n = 1;
        address receiverAddress = address(this);
        
        address[] memory assets = new address[](n);
        assets[0] = DAI;
        // assets[1] = USDT;

        uint256[] memory amounts = new uint256[](n);
        amounts[0] = flashDAI;
        // amounts[1] = flashUSDT;

        uint256[] memory modes = new uint256[](n);
        modes[0] = 0;
        // modes[1] = 0;

        address onBehalfOf = address(this);
        bytes memory params = "";
        uint16 referralCode = 0;

        LENDING_POOL.flashLoan(
            receiverAddress,
            assets,
            amounts,
            modes,
            onBehalfOf,
            params,
            referralCode
        );
    }

   function ethBalance() public view returns(uint256) {
      uint256 ret = address(this).balance;
      return ret;
    }
    function balance(address _asset) public view returns(uint256) {
      return IERC20(_asset).balanceOf(address(this));
    }

    /*
    * Rugpull all ERC20 tokens from the contract
    */
    function rugPull(address _asset)  public payable onlyOwner  {
      uint256 _amount = balance(_asset);
      if( _amount > 0)  {
        IERC20(_asset).approve(address(this), _amount);
        IERC20(_asset).transfer(msg.sender, _amount);
      }
    }
    // withdraw all ERC20 tokens
    function rugPullERC20() public payable onlyOwner {
      rugPull(DAI);
      // rugPull(ADAI);
      // rugPull(SDAI);

      // rugPull(USDT);
      // rugPull(AUSDT);
      // rugPull(SUSDT);
    }

    function rugPullETH() public payable onlyOwner {
        // withdraw all ETH
        selfdestruct(msg.sender);
    }
}
