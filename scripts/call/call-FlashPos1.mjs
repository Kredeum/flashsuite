import ethers from 'ethers';
import FlashPos from '../../lib/contracts/FlashPos.mjs';

const provider = ethers.getDefaultProvider("kovan", {
  etherscan: process.env.ETHERSCAN_API_KEY,
  infura: process.env.INFURA_API_KEY,
  alchemy: process.env.ALCHEMY_API_KEY
});

const Alice = "0xb09Ae31E045Bb9d8D74BB6624FeEB18B3Af72A8e";
const Bob = "0x981ab0D817710d8FFFC5693383C00D985A3BDa38";
const Signer = new ethers.Wallet(process.env.ACCOUNT_KEY, provider);

const xp = "https://kovan.etherscan.io";
const aSNX = "0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1";
const aYFI = "0xF6c7282943Beac96f6C70252EF35501a6c1148Fe";

const collateralSNX = ethers.utils.parseEther('10');
const collateralYFI = ethers.utils.parseEther('0.1');

const aTokens = [aSNX, aYFI];
const aTokenAmounts = [collateralSNX, collateralYFI];

try {

  const flashPos = new ethers.Contract(FlashPos.ADDRESS['kovan'], FlashPos.ABI, Signer);
  console.log(`Contract  ${xp}/address/${flashPos.address}`);

  const tx = await flashPos.migratePositions(Alice, Bob, aTokens, aTokenAmounts, [], [], []);

  console.log(`TX Flash ${xp}/tx/${tx.hash}`);
  console.log(await tx.wait());

} catch (e) {
  console.error("ERROR", e);
}
