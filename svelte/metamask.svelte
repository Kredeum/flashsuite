<svelte:options tag="svelte-metamask" immutable={true} />

<script>
  import { ethers } from "ethers";
  import detectEthereumProvider from "@metamask/detect-provider";

  export let chainId = "";
  export let address = "";
  export let network = "";
  export let balance = 0;
  export let signer = {};

  async function handleChainChanged(_chainId) {
    chainId = _chainId;
    setNetwork(chainId);
    setBalance(address);
  }

  async function handleAccountsChanged(_accounts) {
    if (_accounts.length === 0) {
      connectMetamask();
    } else if (_accounts[0] !== address) {
      address = _accounts[0];
      setBalance(address);
      signer = new ethers.providers.Web3Provider(ethereum).getSigner();
    }
  }
  async function setBalance(_address) {
    if (_address) {
      ethereum
        .request({
          method: "eth_getBalance",
          params: [_address, "latest"],
        })
        .then((bal) => {
          balance = (bal / 10 ** 18).toString();
        })
        .catch(console.error);
    }
  }
  function setNetwork(_chainId) {
    const networks = new Map([
        [1, "mainnet"],
        [3, "ropsten"],
        [4, "rinkeby"],
        [5, "goerli"],
        [42, "kovan"],
      ]);
    if (_chainId) {
      network = networks.get(Number(_chainId));
    }
  }
  function connectMetamask() {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          alert("Please connect to MetaMask.");
        } else {
          console.error(err);
        }
      });
  }

  async function init() {
    const provider = await detectEthereumProvider();
    if (provider) {
      if (provider !== window.ethereum) {
        alert("Do you have multiple wallets installed?");
      }

      chainId = await ethereum.request({ method: "eth_chainId" });
      handleChainChanged(chainId);

      ethereum
        .request({ method: "eth_accounts" })
        .then(handleAccountsChanged)
        .catch((err) => {
          console.error(err);
        });
      // connectMetamask();

      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("accountsChanged", handleAccountsChanged);
    } else {
      console.log("Please install MetaMask!");
    }
  }
  init();
</script>

{#if address}
  <p><strong>account connected</strong></p>
  <small>
    account: {address}<br />
    balance: {balance}<br />
    network: {network}
  </small>
{:else}
  <button on:click={connectMetamask}>Connect Metamask</button>
{/if}
<hr />
