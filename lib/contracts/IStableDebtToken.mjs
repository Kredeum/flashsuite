const IStableDebtToken = {
  'ADDRESS': {
    'mainnet': '',
    'kovan': '',
  }
};
IStableDebtToken.ABI = [
  'function approveDelegation(address delegatee, uint256 amount) external',
  'function borrowAllowance(address fromUser, address toUser) external view returns(uint256)',
  'function mint(address user, address onBehalfOf, uint256 amount, uint256 rate) external returns(bool)',
  'function burn(address user, uint256 amount) external',
  'function getAverageStableRate() external view returns(uint256)',
  'function getUserStableRate(address user) external view returns(uint256)',
  'function getUserLastUpdated(address user) external view returns(uint40)',
  'function getSupplyData() external view returns( uint256, uint256, uint256, uint40)',
  'function getTotalSupplyLastUpdated() external view returns(uint40)',
  'function getTotalSupplyAndAvgRate() external view returns(uint256, uint256)',
  'function principalBalanceOf(address user) external view returns(uint256)',
  'event Mint(address indexed user, address indexed onBehalfOf, uint256 amount, uint256 currentBalance, uint256 balanceIncrease, uint256 newRate, uint256 avgStableRate, uint256 newTotalSupply)',
  'event Burn(address indexed user, uint256 amount, uint256 currentBalance, uint256 balanceIncrease, uint256 avgStableRate, uint256 newTotalSupply)'
];

export default IStableDebtToken;
