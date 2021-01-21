// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

interface IFlashLoanReceiver {
  function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external returns (bool);
}

interface IArbitrageStrategy {
  function arbitrage() external payable;
}

interface IWETH {
  function deposit() external payable;
  function withdraw(uint256) external;
  function balanceOf(address account) external view returns (uint256);
  function approve(address guy, uint256 wad) external returns (bool);
  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external returns (bool);
}

interface IWETHGateway {
  function depositETH(address onBehalfOf, uint16 referralCode) external payable;
  function withdrawETH(uint256 amount, address onBehalfOf) external;
  function repayETH(
    uint256 amount,
    uint256 rateMode,
    address onBehalfOf
  ) external payable;
  function borrowETH(
    uint256 amount,
    uint256 interesRateMode,
    uint16 referralCode
  ) external;
  function getWETHAddress( ) external view returns (address);
  function getAWETHAddress( ) external view returns (address);
  function getLendingPoolAddress( ) external view returns (address);
}


interface ILendingPool {
  function flashLoan(
    address receiverAddress,
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata modes,
    address onBehalfOf,
    bytes calldata params,
    uint16 referralCode
  ) external;
}

contract DemoFlashloanReceiver is IFlashLoanReceiver {

  // MAINNET
  // address constant LENDING_POOL = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9;
  // IWETH constant WETH = IWETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
  // IArbitrageStrategy constant STRATEGY = IArbitrageStrategy(0x8F1034CBE5827b381067fCEfA727C069c26270c4);

  // KOVAN
  ILendingPool LENDING_POOL = ILendingPool(0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe);
  IWETHGateway WETHGateway = IWETHGateway(0xf8aC10E65F2073460aAD5f28E1EABE807DC287CF);
  IWETH WETH = IWETH(0xd0A1E359811322d97991E03f863a0C30C2cF029C);
  IArbitrageStrategy constant STRATEGY = IArbitrageStrategy(0xaE2ac8Fa059D0Cf664fC78Dc47981994d2415727);

  // ["0xd0A1E359811322d97991E03f863a0C30C2cF029C"],[7000],[9],"0x981ab0D817710d8FFFC5693383C00D985A3BDa38",[""]


  event opExec(address indexed _from, address indexed _asset, uint256 _amount, uint256 _premium);
  event opBalances(uint256 _ethBalance, uint256 _wethBalance);

  function addressWETH() public view returns(address) {
    return WETHGateway.getWETHAddress();
  }
  function addressAWETH() public view returns(address) {
    return WETHGateway.getAWETHAddress();
  }
  function addressLendingPool() public view returns(address) {
    return WETHGateway.getLendingPoolAddress();
  }

  function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external override returns (bool) {

    emit opExec(msg.sender, assets[0], amounts[0], premiums[0]);
    emit opBalances(address(this).balance, WETH.balanceOf(address(this)));
    emit opBalances(address(msg.sender).balance, WETH.balanceOf(msg.sender));

    require(assets[0] == address(WETH), "Invalid asset");
    require(amounts[0] < 0.01 ether, "Invalid amount");


    uint16 referralCode = 0;
    address onBehalfOf = address(this); // msg.sender;

    // WETHGateway.depositETH{value: amounts[0]}(onBehalfOf, referralCode);

    // STRATEGY.arbitrage{value: amounts[0]}();

    // emit opBalances(address(this).balance, WETH.balanceOf(this));

    // WETHGateway.withdrawETH(address(this).balance , onBehalfOf);

    // // Approve the LendingPool contract allowance to *pull* the owed amount
    // WETH.approve(address(LENDING_POOL), WETH.balanceOf(address(this)));

    return true;
  }

  function flashLoanCall() public {
    require(msg.sender == 0x981ab0D817710d8FFFC5693383C00D985A3BDa38, "Only admin can flashloan");

    address receiverAddress = address(this);

    address[] memory assets = new address[](1);
    assets[0] = address(WETH);

    uint256[] memory amounts = new uint256[](1);
    amounts[0] = 70000;

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
  receive() external payable {}
}
