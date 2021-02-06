import { BigNumber } from 'ethers';

const aaveDashboard = {};

aaveDashboard.getUserData(_user, _provider, _log = false) {

  const totalCollateralETH = BigNumber.from('0x010753d46be6b304f3');
  const totalDebtETH = BigNumber.from('0xb43757565b9db591');
  const availableBorrowsETH = BigNumber.from('0x041cf08ec5df9ab3');
  const currentLiquidationThreshold = BigNumber.from('0x1d4c');
  const ltv = BigNumber.from('0x1b58');
  const healthFactor = BigNumber.from('0x0f355a868922ab1e');

  return {
    tokens: [
      {
        address: '0x28f92b4c8Bdab37AF6C4422927158560b4bB446e',
        amount: '100037902572529552020343',
        symbol: 'aBAT',
        type: 0,
        decimals: 18,
        asset: '0x2d12186Fbb9f9a8C28B3FfdD4c42920f8539D738',
        liq: 7500,
        coll: true
      },
      {
        address: '0xBE9B058a0f2840130372a81eBb3181dcE02BE957',
        amount: '21514265890',
        symbol: 'vdUSDC',
        type: 2,
        decimals: 6,
        asset: '0xe22da380ee6B445bb8273C81944ADEB6E8450422',
        liq: 8500,
        coll: true
      }
    ],
    account: [
      totalCollateralETH,
      totalDebtETH,
      availableBorrowsETH,
      currentLiquidationThreshold,
      ltv,
      healthFactor
    ]
  }

}

export default aaveDashboard;
