import CoinGecko from 'coingecko-api';
const CoinGeckoClient = new CoinGecko();

(async function() {
  const pad = 10;
  const pageMax = 4;
  let page = 0;
  let res, price, max, min, max_market_name, min_market_name;
  
  res = await CoinGeckoClient.simple.price({ ids: ['ethereum'], vs_currencies: ['btc'] });
  price = res.data.ethereum.btc;
  // console.log(String(price).padEnd(pad),  "<= simple.price data.ethereum.btc");
  min = 2 * price;
  max = 0;

  do {
    console.log("page", page);

    res = await CoinGeckoClient.coins.fetchTickers("ethereum", { page: page++ });
    res.data.tickers.forEach(ticker => {
      price = ticker.converted_last.btc;
      if (price > 0) {
        if (price > max) {
          max = price;
          max_market_name = ticker;
          console.log("max", price, ticker.market.name);
        }
        if (price < min) {
          min = price;
          min_market_name = ticker;
          console.log("min", price, ticker.market.name);
        }
      }

      // console.log(String(price).padEnd(pad), "<= coins.fetchTickers", ticker.market.name);
    });
  } while ((page < pageMax) && (res.data.tickers.length > 0))

  console.log(min_market_name, "=>", min);
  console.log(max_market_name, "=>", max);
  console.log(Math.abs((min - max) * 100 / max).toFixed(2) + '%', Math.abs(min - max));
})()
