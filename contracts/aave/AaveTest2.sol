// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

// https://github.com/aave/code-examples-protocol/tree/main/V2/Flash%20Loan%20-%20Batch

import { FlashLoanReceiverBase } from "./FlashLoanReceiverBase.sol";
import { ILendingPool, ILendingPoolAddressesProvider, IERC20 } from "./Interfaces.sol";
import { SafeMath } from "./Libraries.sol";

import "./Ownable.sol";

contract AaveTest2 is FlashLoanReceiverBase, Ownable {
    using SafeMath for uint256;

    address address1 = 0x981ab0D817710d8FFFC5693383C00D985A3BDa38;
    address address2 = 0xb09Ae31E045Bb9d8D74BB6624FeEB18B3Af72A8e;

    address kovanDai = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;
    uint256 flashDai = 1000 ether;
    uint256 borrowDai = 500 ether;

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
        someFunction1();
        // someFunction2();
        // someFunction3();

        // Approve the LendingPool contract allowance to *pull* the owed amount
        for (uint i = 0; i < assets.length; i++) {
            uint amountOwing = amounts[i].add(premiums[i]);
            IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
        }
        return true;
    }

    /* Deposit Dai */
    function daiDeposit(address onBehalfOf) internal {
        require( daiBalance() >=  flashDai, "Insufficient funds for deposit");

        IERC20(kovanDai).approve(address(LENDING_POOL), flashDai);
        LENDING_POOL.deposit(kovanDai, flashDai, onBehalfOf, uint16(0)); 
    }
    /* Withdraw Dai */
    function daiWithdraw(address onBehalfOf) internal {
        require( daiBalance() >=  flashDai, "Insufficient funds for withdraw");

        LENDING_POOL.withdraw(kovanDai, flashDai, onBehalfOf);
    }


    // Unchanged : Borrow and Repay for the contract
    function someFunction1() internal {
        daiDeposit(address(this));
        daiBorrow(address(this));
        daiRepay(address(this));
        daiWithdraw(address(this));
    }
    // Unchanged : Borrow and Repay or the owner
    function someFunction2() internal {
        daiDeposit(msg.sender);
        daiBorrow(msg.sender);
        daiRepay(msg.sender);
        daiWithdraw(msg.sender);
    }
    // Swap address, repay loan on A1to borrow on A2
    function someFunction3() internal {
        daiRepay(address1);
        daiBorrow(address2);
    }


    /* Borrow Dai */
    function daiBorrow(address onBehalfOf) internal {
        require( daiBalance() >=  borrowDai, "Insufficient funds for borrow");
        LENDING_POOL.borrow(kovanDai, borrowDai, 1, uint16(0), onBehalfOf );
    }
    /* Repay Dai */
    function daiRepay(address onBehalfOf) internal {
        require( daiBalance() >=  borrowDai, "Insufficient funds for repay");
        IERC20(kovanDai).approve(address(LENDING_POOL), borrowDai);
        LENDING_POOL.repay(kovanDai, borrowDai, 1, onBehalfOf );  
    }



    function myFlashLoanCall() public onlyOwner {

        address receiverAddress = address(this);

        address[] memory assets = new address[](1);
        assets[0] = kovanDai; 

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = flashDai;


        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

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
    
    /*
    * Rugpull all ERC20 tokens from the contract
    */
    function daiBalance() public view returns(uint256) {
      uint256 ret = IERC20(kovanDai).balanceOf(address(this));
      return ret;
    }           
  
   function ethBalance() public view returns(uint256) {
      uint256 ret = address(this).balance;
      return ret;
    }        

    function rugPullERC20() public payable onlyOwner {        
        // withdraw all ERC20 tokens
        IERC20(kovanDai).transfer(msg.sender, daiBalance());
    }

    function rugPullETH() public payable onlyOwner {        
        // withdraw all ETH
        (bool success,) = msg.sender.call{ value: ethBalance() }("");
        require(success);
    }
}
