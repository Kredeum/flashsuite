// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

// https://github.com/aave/code-examples-protocol/tree/main/V2/Flash%20Loan%20-%20Batch

import { FlashLoanReceiverBase } from "../aave/FlashLoanReceiverBase.sol";
import { ILendingPool, ILendingPoolAddressesProvider, IERC20, IProtocolDataProvider, IStableDebtToken } from "../aave/Interfaces.sol";
import { SafeMath } from "../aave/Libraries.sol";

import "../aave/Ownable.sol";

contract FlashAccounts is FlashLoanReceiverBase, Ownable {
    using SafeMath for uint256;

    uint256 public FLASHLOAN_PREMIUM_TOTAL;

    address DAI = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;
    address aSNX = 0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1;

    address thisContract;

    uint256 collSNX = 20 ether;
    uint256 aliceDAILoan = 10 ether;
    uint256 flashLoanAmountDAI = 10 ether;
    uint256 flashLoanFee = flashLoanAmountDAI.mul(FLASHLOAN_PREMIUM_TOTAL).div(10000);
    uint256 bobDAILoan = flashLoanAmountDAI.add(flashLoanFee);

    event opExec(string desc, address indexed _from, address indexed _asset, uint256 _amount, uint256 _premium);

    IProtocolDataProvider constant dataProvider = IProtocolDataProvider(address(0x744C1aaA95232EeF8A9994C4E0b3a89659D9AB79));


    constructor(ILendingPoolAddressesProvider _addressProvider) FlashLoanReceiverBase(_addressProvider) public {
      thisContract = address(this);
      FLASHLOAN_PREMIUM_TOTAL = 9;
    }

    function setFlashLoanPremium(uint256 _premium) external onlyOwner {
      FLASHLOAN_PREMIUM_TOTAL = _premium;
    } 

    /**
      * FlashLoan exec function
      *
      * TX4.1	Get FlashLoan
      * TX4.2	Repay Alice Loan
      * TX4.3	Transfer aSNX From Alice to Bob
      * TX4.4	Borrow Bob loan
      * TX4.5	Repay FlashLoan
      *
      * TX5	Get crumbs back
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
      // Decode params
      (address Alice, address Bob ) = abi.decode(params, (address, address));

      // TX4.1 Get FlashLoan
      emit opExec("opExec", msg.sender, assets[0], amounts[0], premiums[0]);

      // TX4.2 Repay Alice Loan
      repay(DAI, aliceDAILoan, Alice);

      // TX4.3 TransferFrom aSNX
      transferFrom(aSNX, collSNX, Alice, Bob);

      // TX4.4 Borrow Bob Loan
      borrow(DAI, bobDAILoan, Bob);

      // TX4.5 (Approve to) Repay FlashLoan
      for (uint i = 0; i < assets.length; i++) {
          uint amountOwing = amounts[i].add(premiums[i]);
          IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
      }
      return true;
    }
    function transferFrom(address _asset, uint256 _amount, address _from, address _to) internal {
        require(IERC20(_asset).transferFrom(_from, _to, _amount), "TransferFrom failed");
    }
    function deposit(address _asset, uint256 _amount, address _onBehalfOf) internal {
      IERC20(_asset).approve(address(LENDING_POOL), _amount);
      LENDING_POOL.deposit(_asset, _amount, _onBehalfOf, 0);
    }
    function withdraw(address _asset, uint256 _amount, address _onBehalfOf) internal {
      LENDING_POOL.withdraw(_asset,  _amount, _onBehalfOf);
    }
    function borrow(address _asset, uint256 _amount, address _onBehalfOf) internal {
      LENDING_POOL.borrow(_asset, _amount, 1, 0, _onBehalfOf);
    }
    function repay(address _asset, uint256 _amount, address _onBehalfOf) internal {
      IERC20(_asset).approve(address(LENDING_POOL), _amount);
      LENDING_POOL.repay(_asset, _amount, 1, _onBehalfOf);
    }

    function swap(address _Alice,address _Bob) public {

        uint n = 1;
        address receiverAddress = thisContract;

        address[] memory assets = new address[](n);
        assets[0] = DAI;
        // assets[1] = SNX;

        uint256[] memory amounts = new uint256[](n);
        amounts[0] = flashLoanAmountDAI;
        // amounts[1] = flashSNX;

        uint256[] memory modes = new uint256[](n);
        modes[0] = 0;
        // modes[1] = 0;

        address onBehalfOf = thisContract;

        bytes memory params = abi.encode(_Alice, _Bob);

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
      uint256 ret = thisContract.balance;
      return ret;
    }
    function balance(address _asset) public view returns(uint256) {
      return IERC20(_asset).balanceOf(thisContract);
    }

    function rugPullERC(address _asset)  public payable onlyOwner  {
      uint256 _amount = balance(_asset);
      if( _amount > 0)  {
        IERC20(_asset).approve(thisContract, _amount);
        IERC20(_asset).transfer(msg.sender, _amount);
      }
    }

    // TX5 : Get crumbs back
    // Withdraw all ETH and ERC20 tokens
    function rugPull() public payable onlyOwner {
      rugPullERC(DAI);

      // withdraw all ETH
      (bool success,) = msg.sender.call{ value: address(this).balance }("");
      require(success);
      selfdestruct(msg.sender);
    }
}
