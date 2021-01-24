<script>
  function _networkGet(chainId) {
    const networks = new Map([
      [1, "mainnet"],
      [3, "ropsten"],
      [4, "rinkeby"],
      [5, "goerli"],
      [42, "kovan"],
    ]);
    return networks.get(Number(chainId));
  }
  function _log(bal) {
    return (bal / 10 ** 18).toString();
  }

  const eth = window.ethereum;
  if (eth) {
    eth.enable();
  } else {
    alert("Install Metamask");
  }

  // init + onChainChanged => chainId => network + onAccountChanged => accounts => address => balance

  // init => chainId
  let chainId = eth.chainId;

  // onChainChanged => chainId
  eth.on("chainChanged", (chainIdChanged) => {
    chainId = chainIdChanged;
  });

  // chainId => network
  let network = "";
  $: network = _networkGet(chainId);

  // network => accounts
  let accounts;
  ethereum.request({ method: "eth_requestAccounts" }).then((res) => {
    accounts = res;
  });

  // onAccountChanged => accounts
  eth.on("accountsChanged", (accountsChanged) => {
    accounts = accountsChanged;
  });

  // accounts => address
  let address = "";
  $: address = accounts && accounts[0];

  // address => balance
  let balance = 0;
  $: if (chainId && address) {
    ethereum
      .request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      .then((bal) => {
        balance = (bal / 10 ** 18).toString();
      });
  }

  // logs
  $: console.log(chainId, network, address, balance);
</script>

<style>
  main {
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  p {
    font-size: 2em;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<svelte:options tag="svelte-metamask" immutable={true} />
<main>
  <h1>Ethereum Balance</h1>
  <p>network: {network} ({chainId})</p>
  <p>address: {address}</p>
  <p>balance: {balance} ETH</p>
</main>
