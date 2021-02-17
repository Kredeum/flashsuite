// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import { FlashLoanReceiverBase } from "../aave/FlashLoanReceiverBase.sol";
import { ILendingPool, ILendingPoolAddressesProvider, IProtocolDataProvider, IStableDebtToken, IAToken } from "../aave/Interfaces.sol";
import { IERC20 } from "../interfaces/IERC20.sol";
import { SafeMath } from "../libraries/SafeMath.sol";

import "../libraries/Ownable.sol";

contract FlashPos is FlashLoanReceiverBase, Ownable {
    using SafeMath for uint256;

    address thisContract;

    event FlashLoanTriggered(address indexed origin, address indexed destination, address[] assets, uint256[] amounts, uint256[] premiums, address initiator);
    event LoansRepaid(address[] assets, uint256[] amounts, uint256[] interestRateModes, address indexed borrower);
    event NewLoan(address indexed asset, uint256 amount, uint256 interestRateMode, address indexed borrower);

    // IProtocolDataProvider constant dataProvider = IProtocolDataProvider(address(0x744C1aaA95232EeF8A9994C4E0b3a89659D9AB79));

    constructor(ILendingPoolAddressesProvider _addressProvider) FlashLoanReceiverBase(_addressProvider) public {
      thisContract = address(this);
    }

    /**
    * Function called by Aave Protocol after receiving the flash loaned amounts
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
      // Get origin account's address
      (address origin, address destination,,,uint256[] memory interestRateModes) = abi.decode(params, (address, address, address[], uint256[], uint256[]));

      emit FlashLoanTriggered(origin, destination, assets, amounts, premiums, initiator);

      // Repay the origin account's loans
      repayMultipleLoans(assets, amounts, interestRateModes, origin);
      
      emit LoansRepaid(assets, amounts, interestRateModes, origin);
      
      transferAndBorrow(assets, amounts, premiums, params);

      return true;
    }

    function repayMultipleLoans(address[] memory _assets, uint256[] memory _amounts, uint256[] memory _interestRateModes, address _onBehalfOf ) internal {
      for (uint i = 0; i < _assets.length; i++) {
          repayLoan(_assets[i], _amounts[i], _interestRateModes[i], _onBehalfOf);
      }
    }

    function repayLoan(address _asset, uint256 _amount, uint256 _interestRateModes, address _onBehalfOf) internal {
      IERC20(_asset).approve(address(LENDING_POOL), _amount);
      LENDING_POOL.repay(_asset, _amount, _interestRateModes, _onBehalfOf);
    }
   
    /**
    * Transfer aTokens from origin to destination account 
    * then borrow on destination account's behalf to repay the flash loans
    * params: same as executeOperation
    */
    function transferAndBorrow(address[] calldata assets, uint256[] calldata amounts, uint256[] calldata premiums, bytes calldata params) internal {
      (address origin, address destination, address[] memory aTokens, uint256[] memory aTokenAmounts, uint256[] memory interestRateModes) = abi.decode(params, (address, address, address[], uint256[], uint256[]));
      
      transferATokens(aTokens, aTokenAmounts, origin, destination);

      borrowToCoverFlashLoans(assets, amounts, interestRateModes, premiums, destination);
    }

    function transferATokens(address[] memory _aTokens, uint256[] memory _aTokenAmounts, address _origin, address _destination) internal {
      for (uint i = 0; i < _aTokens.length; i++) {

        uint256 amountToTransfer;
        uint256 userBalance = IAToken(_aTokens[i]).balanceOf(_origin);

          // Transfer limited by balance
          if ( _aTokenAmounts[i] >  userBalance ) { 
            amountToTransfer = userBalance;
          } else{
            amountToTransfer = _aTokenAmounts[i];
          }
          IERC20(_aTokens[i]).transferFrom(_origin, _destination, amountToTransfer);
      }
    }

    function borrowToCoverFlashLoans(address[] calldata _assets, uint256[] calldata _borrowedAmounts, uint256[] memory _interestRateModes, uint256[] calldata _premiums, address _borrower) internal {
      for (uint i = 0; i < _assets.length; i++) {
          uint amountOwing = _borrowedAmounts[i].add(_premiums[i]);

          LENDING_POOL.borrow(_assets[i], amountOwing, _interestRateModes[i], 0, _borrower);

          emit NewLoan(_assets[i], amountOwing, _interestRateModes[i], _borrower);

          IERC20(_assets[i]).approve(address(LENDING_POOL), amountOwing);
      }
    }

    /**
     * Migrates positions (deposits & loans) from an origin account to a destination account
     * @param _origin Address of the origin account to migrate from
     * @param _destination Address of the destination account to migrate positions to
     * @param _aTokens Addresses of the aTokens to migrate (represent deposits)
     * @param _aTokenAmounts Amounts of aTokens (in the same order). Use uint(-1) to repay the entire debt
     * @param _borrowedUnderlyingAssets Addresses of the underlying tokens (ex: DAI) borrowed by origin to migrate
     * @param _borrowedAmounts Amounts of loans taken by origin to migrate (in the same order). 
        To migrate fully use slightly higher amounts than balance
     * @param _interestRateModes Array of interestRateMode (Stable = 1, Variable = 2)
     * 
     * !!! Necessary approvals for aToken transfers and credit delegation should be obtained prior to calling this function.
     * !!! Tx will fail if the migration moves the Health Factor of either _origin or _destination below the threshold
     */
    function migratePositions(address _origin, address _destination, address[] calldata _aTokens, uint256[] calldata _aTokenAmounts,
     address[] calldata _borrowedUnderlyingAssets, uint256[] calldata _borrowedAmounts, uint256[] calldata _interestRateModes ) public {

        uint numberOfLoans = _borrowedUnderlyingAssets.length;

        // FlashLoan mode is 0 for all because _destination can have 0 collaterals
        uint256[] memory modes = new uint256[](numberOfLoans);
        for (uint i = 0; i < numberOfLoans; i++) {
           modes[i] = 0;
        }

        bytes memory params = abi.encode(_origin, _destination, _aTokens, _aTokenAmounts, _interestRateModes);

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

    function rugPullERC(address _asset) public payable onlyOwner  {
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
