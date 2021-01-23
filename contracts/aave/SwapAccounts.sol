// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

// https://github.com/aave/code-examples-protocol/tree/main/V2/Flash%20Loan%20-%20Batch

import { FlashLoanReceiverBase } from "./FlashLoanReceiverBase.sol";
import { ILendingPool, ILendingPoolAddressesProvider, IERC20, IProtocolDataProvider, IStableDebtToken } from "./Interfaces.sol";
import { SafeMath } from "./Libraries.sol";

import "./Ownable.sol";

contract SwapAccounts is FlashLoanReceiverBase, Ownable {
    using SafeMath for uint256;

    address address1 = 0x981ab0D817710d8FFFC5693383C00D985A3BDa38;
    address address2 = 0xb09Ae31E045Bb9d8D74BB6624FeEB18B3Af72A8e;

    address DAI = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;
    address aSNX = 0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1;

    address Alice = 0xb09Ae31E045Bb9d8D74BB6624FeEB18B3Af72A8e;
    address Bob = 0x981ab0D817710d8FFFC5693383C00D985A3BDa38;
    address contrat;

    uint256 flashDAI = 10 ether;
    uint256 borrowDAI = 8 ether;
    uint256 collSNX = 2 ether;

    event opExec(string desc, address indexed _from, address indexed _asset, uint256 _amount, uint256 _premium);

    IProtocolDataProvider constant dataProvider = IProtocolDataProvider(address(0x744C1aaA95232EeF8A9994C4E0b3a89659D9AB79));


    constructor(ILendingPoolAddressesProvider _addressProvider) FlashLoanReceiverBase(_addressProvider) public {
      contrat = address(this);
    }

    /**
      * FlashLoan exec function
      *
      * TX3.1	Get FlashLoan
      * TX3.2	Repay Alice Loan
      * TX3.3	Transfer aSNX From Alice to Bob
      * TX3.4	Borrow Bob loan
      * TX3.5	Repay FlashLoan
      *
      * TX4	Get crumbs back
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

        // TX3.1 Get FlashLoan
        emit opExec("opExec", msg.sender, assets[0], amounts[0], premiums[0]);
        require(Bob == msg.sender, "Hi anonymous, you are not Bob ?!");

        // TX3.2 Repay Alice Loan
        repay(DAI, borrowDAI, Alice);

        // TX3.3 TransferFrom aSNX
        transferFrom(aSNX, collSNX, Alice, Bob);

        // TX3.4 Borrow Bob Loan
        borrow(DAI, borrowDAI, Bob);

        // TX3.5 (Approve to) Repay FlashLoan
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



    function myFlashLoanCall() public onlyOwner {

        uint n = 1;
        address receiverAddress = contrat;

        address[] memory assets = new address[](n);
        assets[0] = DAI;
        // assets[1] = SNX;

        uint256[] memory amounts = new uint256[](n);
        amounts[0] = flashDAI;
        // amounts[1] = flashSNX;

        uint256[] memory modes = new uint256[](n);
        modes[0] = 0;
        // modes[1] = 0;

        address onBehalfOf = contrat;
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
      uint256 ret = contrat.balance;
      return ret;
    }
    function balance(address _asset) public view returns(uint256) {
      return IERC20(_asset).balanceOf(contrat);
    }

    function rugPullERC(address _asset)  public payable onlyOwner  {
      uint256 _amount = balance(_asset);
      if( _amount > 0)  {
        IERC20(_asset).approve(contrat, _amount);
        IERC20(_asset).transfer(msg.sender, _amount);
      }
    }

    // TX4 : Get crumbs back
    // Withdraw all ETH and ERC20 tokens
    function rugPull() public payable onlyOwner {
      rugPullERC(DAI);

      // withdraw all ETH
      // selfdestruct(msg.sender);
    }
}
