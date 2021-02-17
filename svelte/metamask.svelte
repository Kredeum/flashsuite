<script>
  import detectEthereumProvider from '@metamask/detect-provider';
  import { onMount } from 'svelte';
  import { signer, chainId, addresses } from './metamask.mjs';

  async function handleChainId(_chainId) {
    // console.log('handleChainId <=', _chainId);
    if (_chainId) {
      $chainId = _chainId;
    }
  }
  async function handleAccounts(_accounts) {
    if (_accounts.length === 0) {
      connectMetamask();
    } else if (_accounts[0] !== $signer) {
      $signer = _accounts[0];
      if ($addresses.indexOf($signer) === -1) {
        $addresses.push($signer);
        // console.log('handleAccounts', _accounts, '=>', $signer, $addresses);
      }
    }
  }
  async function connectMetamask() {
    // console.log('connectMetamask');

    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccounts)
      .catch((e) => {
        if (e.code === 4001) {
          alert('Please connect to MetaMask.');
        } else {
          console.error('ERROR eth_requestAccounts', e);
        }
      });
  }
  onMount(async function () {
    // console.log('Metamask init');
    const provider = await detectEthereumProvider();
    if (provider) {
      if (provider !== window.ethereum) {
        alert('Do you have multiple wallets installed?');
      }

      ethereum
        .request({ method: 'eth_accounts' })
        .then(handleAccounts)
        .catch((e) => console.error('ERROR eth_accounts', e));

      ethereum
        .request({ method: 'eth_chainId' })
        .then(handleChainId)
        .catch((e) => console.error('ERROR eth_chainId', e));

      ethereum.on('chainChanged', handleChainId);

      ethereum.on('accountsChanged', handleAccounts);
    } else {
      console.log('Please install MetaMask!');
    }
  });
</script>

<!-- {#if $signer}
  <small>
    {#each $addresses as addr, i}
      <br />address[{i}] {addr}
    {/each}
    <br />$signer {$signer}
    <br />$chainId {$chainId}
  </small>
{:else}
  <button on:click={connectMetamask}>Connect Metamask</button>
{/if} -->
