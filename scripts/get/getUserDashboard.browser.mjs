// version for browser (or node), without hardhat
// run via "node getUserDashboard.browser.mjs"
import { ethers } from 'ethers';
import aaveDashboard from '../lib/aaveDashboard.mjs';

const Alice = "0xb09Ae31E045Bb9d8D74BB6624FeEB18B3Af72A8e";
const Bob = "0x981ab0D817710d8FFFC5693383C00D985A3BDa38";

const provider = ethers.getDefaultProvider('kovan', { etherscan: process.env.ETHERSCAN_API_KEY });

console.log(await aaveDashboard.getUserData(Alice, provider));
console.log(await aaveDashboard.getUserData(Bob, provider, true));
