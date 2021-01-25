const ERC20 = {
  'DAI': {
    'mainnet': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    'ropsten': '0xad6d458402f60fd3bd25163575031acdce07538d',
    'kovan'  : '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
    'rinkeby': '0x6f5390a8cd02d83b23c5f1d594bffb9050eb4ca3'
  },
  'USDT': {
    'mainnet': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'dec': 6
  },
  'COMP': {
    'mainnet': '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  },
  'MKR': {
    'mainnet': '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  },
  'CRC': {
    'xdai': '0x317046Be3c8cbA73707b67A0d5B422553F7FD53E',
  },
  'WETH': {
    'mainnet': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  'BEL': {
    'mainnet': '0xa91ac63d040deb1b7a5e4d4134ad23eb0ba07e14'
  }
};
ERC20.ABI = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',

  // Authenticated Functions
  'function transfer(address to, uint amount) returns (boolean)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)'
];

export default ERC20;
