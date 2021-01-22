// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;
import { SafeMath, SafeERC20 } from "./Libraries.sol";
import { ILendingPoolAddressesProvider, ILendingPool, IProtocolDataProvider, IERC20, IAToken  } from "./Interfaces.sol";


contract PositionMigrator {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    
    address owner;
    
    // addresses should come from providers
    address kovanDai = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;
    address aYFI = 0xF6c7282943Beac96f6C70252EF35501a6c1148Fe;
    address kovanLendingPool = 0x9FE532197ad76c5a68961439604C037EB79681F0;
    address kovanProtocolDataProvider = 0x3c73A5E5785cAC854D468F727c606C07488a29D6;
    
    ILendingPool constant lendingPool = ILendingPool(address(0x9FE532197ad76c5a68961439604C037EB79681F0)); // Kovan
    IProtocolDataProvider constant dataProvider = IProtocolDataProvider(address(0x3c73A5E5785cAC854D468F727c606C07488a29D6)); // Kovan
    
    constructor() public {
        owner = msg.sender;
    }

    function borrow(address _asset, uint256 _amount, uint256 _interestRateMode, address _onBehalfOf) public {
      lendingPool.borrow(_asset, _amount, _interestRateMode, 0, _onBehalfOf);
    }
    
    
    function repayLoan(address _asset, address _borrower, uint256 _amount, uint8 _rateMode) public returns (bool) {
        // (,uint stableDebt, uint variableDebt) = getUserDebtPosition(_asset, _borrower);
        
        //  require(
        // (stableDebt > 0 && _rateMode == 1) || (variableDebt > 0 && _rateMode == 2),
        // "No debt of this type");
        
        // get Dai from sender, assume already approved
        IERC20(_asset).safeTransferFrom(msg.sender, address(this), _amount);
        require(getContractDaiBalance() >= _amount, "Not enough funds to repay loan");
        
        // approve lending pool for dai transfer
        IERC20(_asset).safeApprove(address(kovanLendingPool), _amount);

        try lendingPool.repay(_asset, _amount, _rateMode, _borrower) {
            return true;
        } catch Error(string memory /*reason*/) {
            // This is executed in case
            // revert was called inside getData
            // and a reason string was provided.
            return false;
        } catch (bytes memory /*lowLevelData*/) {
            // This is executed in case revert() was used
            // or there was a failing assertion, division
            // by zero, etc. inside getData.
            return false;
        }
    }

    function migrateATokens(address _asset, address _from, address _to, uint256 _amount) public returns (bool result) {
        // require(asset.isTransferAllowed(_from, _amount), "Health factor does not allow such transfer");
        result = IAToken(_asset).transferFrom(_from, _to, _amount);
    }
    
    function getContractDaiBalance() public view returns(uint256) {
      uint256 balance = IERC20(kovanDai).balanceOf(address(this));
      return balance;
    }
    
    function getUserDebtPosition(address _asset, address _borrower) public view returns (uint256 currentATokenBalance,
      uint256 currentStableDebt,
      uint256 currentVariableDebt) {
        (uint a, uint b, uint c,,,,,,) = dataProvider.getUserReserveData(_asset, _borrower);
       
       return (a,b,c);
    }
    
   
    function rugPull() public payable {
        require(msg.sender == owner);
        // withdraw all dai
        IERC20(kovanDai).transfer(msg.sender, IERC20(kovanDai).balanceOf(address(this)));
        
        selfdestruct(msg.sender);
    }
    
}