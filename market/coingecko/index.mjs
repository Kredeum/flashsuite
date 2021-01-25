import CoinGecko from 'coingecko-api';
const CoinGeckoClient = new CoinGecko();

CoinGeckoClient.ping().then(console.log);

CoinGeckoClient.exchanges.list().then(console.log);

let res= await CoinGeckoClient.simple.price({ ids: ['ethereum'], vs_currencies: ['btc'] });
console.log(String(res.data.ethereum.btc).padEnd(10),
  "<= simple.price data.ethereum.btc");

res= await CoinGeckoClient.coins.markets({ ids: ['ethereum'], vs_currency: 'btc' });
console.log(String(res.data[0].current_price).padEnd(10),
  "<= coins.markets data[0].current_price");
