async function getEthPriceInUSD() {
  let price;
  let gasPrice;

  try {
    const response = await fetch(
      `https://cors-anywhere.herokuapp.com/https://ethgas.watch/api/gas`
    );
    const data = await response.json();

    price = data?.ethPrice;
    gasPrice = data?.fast;
    console.log("gasPrice", gasPrice);
  } catch (err) {
    console.log("error fetching eth price", err);
    price = 1747;
  }

  return { ethPrice: price, gasPrice };
}

export default getEthPriceInUSD;
