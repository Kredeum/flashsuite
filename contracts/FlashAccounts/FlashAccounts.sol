// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

// https://github.com/aave/code-examples-protocol/tree/main/V2/Flash%20Loan%20-%20Batch

import { FlashLoanReceiverBase } from "../aave/FlashLoanReceiverBase.sol";
import { ILendingPool, ILendingPoolAddressesProvider, IERC20, IProtocolDataProvider, IStableDebtToken, IAToken } from "../aave/Interfaces.sol";
import { SafeMath } from "../aave/Libraries.sol";

import "../aave/Ownable.sol";

contract FlashAccounts is FlashLoanReceiverBase, Ownable {
    using SafeMath for uint256;

    address thisContract;

    event opExec(string desc, address indexed _from, address indexed _asset, uint256 _amount, uint256 _premium);

    IProtocolDataProvider constant dataProvider = IProtocolDataProvider(address(0x744C1aaA95232EeF8A9994C4E0b3a89659D9AB79));

    constructor(ILendingPoolAddressesProvider _addressProvider) FlashLoanReceiverBase(_addressProvider) public {
      thisContract = address(this);
    }

    /**
      * FlashLoan exec function
      *
      * TX4.1	Get FlashLoan
      * TX4.2	Repay Alice Loan
      * TX4.3	Transfer aTokens From Alice to Bob
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
      (address Alice,,,,uint256[] memory interestRateModes) = abi.decode(params, (address, address, address[], uint256[], uint256[]));

      // TX4.1 Get FlashLoan
      // TODO: include other assets
      emit opExec("opExec", msg.sender, assets[0], amounts[0], premiums[0]);

      // TX4.2 Repay Alice's loans
      repayMultipleLoans(assets, amounts, interestRateModes, Alice);

      transferAndBorrow(assets, amounts, premiums, params);

      return true;
    }


    function transferAndBorrow(address[] calldata assets, uint256[] calldata amounts, uint256[] calldata premiums, bytes calldata params) internal {
      (address Alice, address Bob, address[] memory aTokens, uint256[] memory aTokenAmounts, uint256[] memory interestRateModes) = abi.decode(params, (address, address, address[], uint256[], uint256[]));
      
      transferATokens(aTokens, aTokenAmounts, Alice, Bob);

      borrowToCoverFlashLoans(assets, amounts, interestRateModes, premiums, Bob);
    }

    function transferATokens(address[] memory _aTokens, uint256[] memory _aTokenAmounts, address _from, address _to) internal {
      for (uint i = 0; i < _aTokens.length; i++) {

          uint256 amountToTransfer = _aTokenAmounts[i];

          // Transfer whole balance if aTokenAmount == -1
          if (amountToTransfer == type(uint256).max) {
            uint256 userBalance = IAToken(_aTokens[i]).balanceOf(_from);
            amountToTransfer = userBalance;
          }

          transferFrom(_aTokens[i], amountToTransfer, _from, _to);
      }
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
    
    function borrowToCoverFlashLoans(address[] calldata _assets, uint256[] calldata _borrowedAmounts, uint256[] memory _interestRateModes, uint256[] calldata _premiums, address _borrower) internal {
      for (uint i = 0; i < _assets.length; i++) {
          uint amountOwing = _borrowedAmounts[i].add(_premiums[i]);

          LENDING_POOL.borrow(_assets[i], amountOwing, _interestRateModes[i], 0, _borrower);

          IERC20(_assets[i]).approve(address(LENDING_POOL), amountOwing);
      }
    }

    function repayMultipleLoans(address[] memory _assets, uint256[] memory _amounts, uint256[] memory _interestRateModes, address _onBehalfOf ) internal {
      for (uint i = 0; i < _assets.length; i++) {
          repay(_assets[i], _amounts[i], _interestRateModes[i], _onBehalfOf);
      }
    }

    function repay(address _asset, uint256 _amount, uint256 _interestRateModes, address _onBehalfOf) internal {
      IERC20(_asset).approve(address(LENDING_POOL), _amount);
      LENDING_POOL.repay(_asset, _amount, _interestRateModes, _onBehalfOf);
    }

    function migratePositions(address _from, address _to, address[] calldata _aTokens, uint256[] calldata _aTokenAmounts,
     address[] calldata _borrowedUnderlyingAssets, uint256[] calldata _borrowedAmounts, uint256[] calldata _interestRateModes ) public {

        uint numberOfLoans = _borrowedUnderlyingAssets.length;

        uint256[] memory modes = new uint256[](numberOfLoans);
        for (uint i = 0; i < numberOfLoans; i++) {
           modes[i] = 0;
        }

        bytes memory params = abi.encode(_from, _to, _aTokens, _aTokenAmounts, _interestRateModes);

        uint16 referralCode = 0;

        LENDING_POOL.flashLoan(
            thisContract, // receiverAddress
            _borrowedUnderlyingAssets,
            _borrowedAmounts,
            modes,
            thisContract, // onBehalfOf
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
        IERC20(_asset).transfer(msg.sender, _amount);
      }
    }

    // TX5 : Get crumbs back
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
