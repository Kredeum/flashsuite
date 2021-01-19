import balance from "./lib/balance.mjs";
import ERC20 from "./lib/erc20.mjs";
import hre from "hardhat";
const e = hre.ethers;

process.env.ETH_LOG = true;

function _balances() {
  console.log("");
  balance(signer.address, { 'token': 'ETH', 'chain': 'kovan' });
  balance(signer.address, { 'token': 'DAI', 'chain': 'kovan' });
  balance(aaveTest.address, { 'token': 'ETH', 'chain': 'kovan' });
  balance(aaveTest.address, { 'token': 'DAI', 'chain': 'kovan' });
}

// Aave Deployed Contracts Addresses : https://docs.aave.com/developers/deployed-contracts
const kovanLendingPoolAddressesProvider = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";

const AaveTest = await e.getContractFactory("AaveTest");
const aaveTest = await AaveTest.deploy(kovanLendingPoolAddressesProvider);
await aaveTest.deployed();
console.log("Owner ? ", await aaveTest.isOwner());

console.log("AaveTest deployed to:", aaveTest.address);
// AaveTest deployed to: 0xD8b86a45a43c816C74e3b7891110615647CBA9c3

// send 0,1 ether to contract
const signer = (await e.getSigners())[0];
_balances();

const tx1 = await signer.sendTransaction({
  to: aaveTest.address,
  value: e.utils.parseEther("0.1")
});
await tx1.wait();
_balances();

// send DAI to contract 
const kovanDai = ERC20["DAI"]["kovan"];
const abiErc20Transfert = ["function transfer(address to, uint amount) returns (boolean)"];
const contractDai = new e.Contract(kovanDai, abiErc20Transfert, signer);
const tx2 = await contractDai.transfer(aaveTest.address, e.utils.parseEther("100"));
await tx2.wait();
_balances();

console.log("aaveTest.myFlashLoanCall()", await aaveTest.myFlashLoanCall());
_balances();

await aaveTest.rugPull();
_balances();
