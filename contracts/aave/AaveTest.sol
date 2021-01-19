// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

// https://github.com/aave/code-examples-protocol/tree/main/V2/Flash%20Loan%20-%20Batch

import { FlashLoanReceiverBase } from "./FlashLoanReceiverBase.sol";
import { ILendingPool, ILendingPoolAddressesProvider, IERC20 } from "./Interfaces.sol";
import { SafeMath } from "./Libraries.sol";

import "./Ownable.sol";
import "./console.sol";

/*
* A contract that executes the following logic in a single atomic transaction:
*
*   1. Get a flash loan of 100 DAI
*   2. Deposit flash 110 DAI onto the Aave V2 lending pool
*   3. Repay 100 USDT 
*   3. Borrow 100 DAI
*   5. Withdraw flash 110 DAI from the Aave V2 lending pool
*   6. Repay back flash loan DAI + including fee 9bps 
*
*/
contract AaveTest is FlashLoanReceiverBase, Ownable {
    using SafeMath for uint256;

    address kovanDai = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;
    uint256 flashDai;

    constructor(ILendingPoolAddressesProvider _addressProvider) FlashLoanReceiverBase(_addressProvider) public {
    }

    
    /**
        This function is called after your contract has received the flash loaned amount
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
        console.logBytes(params);
        console.log("asset", assets[0]);
        console.log("amount", amounts[0]);
        console.log("initiator", initiator);

        // target aave account
        // address targetAccount = msg.sender;
        address targetAccount = address(this);

        // deposit the flash DAI to target account
        IERC20(kovanDai).approve(address(LENDING_POOL), flashDai);
        LENDING_POOL.deposit(kovanDai, flashDai, targetAccount, uint16(0));  

        // // borrow DAI for target account
        // LENDING_POOL.borrow(kovanDai, flashDai, 1, uint16(0), targetAccount );

        // // repay DAI for target account
        // LENDING_POOL.repay(kovanDai, flashDai, 1, targetAccount );

        // withdraw the flash DAI to this contract
        LENDING_POOL.withdraw(kovanDai, flashDai, address(this));


        // Approve the LendingPool contract allowance to *pull* the owed amount
        for (uint i = 0; i < assets.length; i++) {
            uint amountOwing = amounts[i].add(premiums[i]);
            IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
        }
        return true;
    }

    function myFlashLoanCall(uint256 _amount) public onlyOwner {

        flashDai = _amount;

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

    function transfer(address recipient, uint256 amount) public payable onlyOwner {
        (bool success,  ) =  recipient.call{ value: amount }("");
        require(success, "ETH transfert failed");
    }   
    
    /*
    * Rugpull all ERC20 tokens from the contract
    */
    function rugPull() public payable onlyOwner {        
        // withdraw all ETH
        msg.sender.call{ value: address(this).balance }("");
  
        // withdraw all ERC20 tokens
        IERC20(kovanDai).transfer(msg.sender, IERC20(kovanDai).balanceOf(address(this)));
    }


}
