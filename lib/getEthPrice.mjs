async function getEthPriceInUSD() {
  let price = 1746;

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum`
    );
    const [ethereum] = await response.json();
    price = ethereum.current_price;
    console.log("price", price);
  } catch {
    console.log("error fetching eth price");
  }

  return price;
}

export default getEthPriceInUSD;
