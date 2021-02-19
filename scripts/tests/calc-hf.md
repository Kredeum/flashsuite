
[GitHub Aave LendingPool](https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol)
address user
reserveData = LendingPool.getReserveData(asset);
userConfig = LendingPool.getUserConfiguration(user);
reserves
reservesCount
oracle

{ totalCollateralInETH, totalDebtInETH, availableBorrowsETH, avgLiquidationThreshold, ltv, healthFactor } = 
 LendingPool.getUserAccountData(user);


[GitHub Aave GenericLogic](https://github.com/aave/protocol-v2/tree/master/contracts/protocol/libraries/logic)
{ totalCollateralInETH, totalDebtInETH, , avgLiquidationThreshold } = 
GenericLogic.calculateUserAccountData(user, reservesData, userConfig, reserves, reservesCount, oracle);
GenericLogic.calculateHealthFactorFromBalances(totalCollateralInETH, totalDebtInETH, liquidationThreshold);



```    
/**
   * @dev Calculates the health factor from the corresponding balances
   * @param totalCollateralInETH The total collateral in ETH
   * @param totalDebtInETH The total debt in ETH
   * @param liquidationThreshold The avg liquidation threshold
   * @return The health factor calculated from the balances provided
   **/
 function calculateHealthFactorFromBalances(
    uint256 totalCollateralInETH,
    uint256 totalDebtInETH,
    uint256 liquidationThreshold
  ) internal pure returns (uint256) {
    if (totalDebtInETH == 0) return uint256(-1);

    return (totalCollateralInETH.percentMul(liquidationThreshold)).wadDiv(totalDebtInETH);
  }
```

```
( 
      vars.totalCollateralInETH,
      vars.totalDebtInETH,
      ,
      vars.avgLiquidationThreshold,

    ) = calculateUserAccountData(user, reservesData, userConfig, reserves, reservesCount, oracle);
```

```
/**
   * @dev Calculates the user data across the reserves.
   * this includes the total liquidity/collateral/borrow balances in ETH,
   * the average Loan To Value, the average Liquidation Ratio, and the Health factor.
   * @param user The address of the user
   * @param reservesData Data of all the reserves
   * @param userConfig The configuration of the user
   * @param reserves The list of the available reserves
   * @param oracle The price oracle address
   * @return The total collateral and total debt of the user in ETH, the avg ltv, liquidation threshold and the HF
   **/
  function calculateUserAccountData(
    address user,
    mapping(address => DataTypes.ReserveData) storage reservesData,
    DataTypes.UserConfigurationMap memory userConfig,
    mapping(uint256 => address) storage reserves,
    uint256 reservesCount,
    address oracle
  )
    internal
    view
    returns (
      uint256,
      uint256,
      uint256,
      uint256,
      uint256
    )
  ```