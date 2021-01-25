// this is to support both browser and node
const SDK = typeof window !== 'undefined' ? window.COIN_API_SDK : require("./coinapi_v1")["default"];

const sdk = new SDK("078D04C3-4D9E-4223-90C3-8BD3BFB1C27A");

function run() {
  const t = new Date(Date.parse("2016-11-01T22:08:41+00:00"));

  sdk.metadata_list_exchanges().then(function (exchanges) {
    console.log('exchanges:');
    console.log('number: ', exchanges.length);
    exchanges.forEach(x=> { console.log(x); });

  });
  sdk.metadata_list_assets().then(function (Metadata_list_assets) {
    console.log('Metadata_list_assets:');
    console.log('number: ', Metadata_list_assets.length);
    Metadata_list_assets.forEach(x=> { console.log(x); });

  });
  sdk.metadata_list_symbols().then(function (Metadata_list_symbols) {
    console.log('Metadata_list_symbols:');
    console.log('number: ', Metadata_list_symbols.length);
    Metadata_list_symbols.forEach(x=> { console.log(x); });

  });
  sdk.exchange_rates_get_specific_rate("BTC", "USD", t).then(function (Exchange_rates_get_specific_rate) {
    console.log('Exchange_rates_get_specific_rate:');
    console.log(Exchange_rates_get_specific_rate); 

  });
  sdk.exchange_rates_get_all_current_rates("BTC").then(function (Exchange_rates_get_all_current_rates) {
    console.log('Exchange_rates_get_all_current_rates:');
    console.log(Exchange_rates_get_all_current_rates);
  });
  sdk.ohlcv_list_all_periods().then(function (Ohlcv_list_all_periods) {
    console.log('Ohlcv_list_all_periods:');
    console.log('number: ', Ohlcv_list_all_periods.length);
    Ohlcv_list_all_periods.forEach(x=> { console.log(x); });

  });
  sdk.ohlcv_latest_data("BITSTAMP_SPOT_BTC_USD", "1MIN", 5).then(function (Ohlcv_latest_data) {
    console.log('Ohlcv_latest_data:');
    console.log('number: ', Ohlcv_latest_data.length);
    Ohlcv_latest_data.forEach(x=> { console.log(x); });

  });
  sdk.ohlcv_historic_data("BITSTAMP_SPOT_BTC_USD", "1MIN", t, new Date(), 5).then(function (Ohlcv_historic_data) {
    console.log('Ohlcv_historic_data:');
    console.log('number: ', Ohlcv_historic_data.length);
    Ohlcv_historic_data.forEach(x=> { console.log(x); });

  });
  sdk.trades_latest_data_all(5).then(function (Trades_latest_data_all) {
    console.log('Trades_latest_data_all:');
    console.log('number: ', Trades_latest_data_all.length);
    Trades_latest_data_all.forEach(x=> { console.log(x); });

  });
  sdk.trades_latest_data_symbol("BITSTAMP_SPOT_BTC_USD", 5).then(function (Trades_latest_data_symbol) {
    console.log('Trades_latest_data_symbol:');
    console.log('number: ', Trades_latest_data_symbol.length);
    Trades_latest_data_symbol.forEach(x=> { console.log(x); });

  });
  sdk.trades_historical_data("BITSTAMP_SPOT_BTC_USD", t, new Date(), 5).then(function (Trades_historical_data) {
    console.log('Trades_historical_data:');
    console.log('number: ', Trades_historical_data.length);
    Trades_historical_data.forEach(x=> { console.log(x); });

  });
  sdk.quotes_current_data_all().then(function (Quotes_current_data_all) {
    console.log('Quotes_current_data_all:');
    console.log('number: ', Quotes_current_data_all.length);
    Quotes_current_data_all.forEach(x=> { console.log(x); });

  });
  sdk.quotes_current_data_symbol("BITSTAMP_SPOT_BTC_USD").then(function (Quotes_current_data_symbol) {
    console.log('Quotes_current_data_symbol:');
    console.log(Quotes_current_data_symbol);
  });
  sdk.quotes_latest_data_all(5).then(function (Quotes_latest_data_all) {
    console.log('Quotes_latest_data_all:');
    console.log('number: ', Quotes_latest_data_all.length);
    Quotes_latest_data_all.forEach(x=> { console.log(x); });

  });
  sdk.quotes_latest_data_symbol("BITSTAMP_SPOT_BTC_USD", 5).then(function (Quotes_latest_data_symbol) {
    console.log('Quotes_latest_data_symbol:');
    console.log('number: ', Quotes_latest_data_symbol.length);
    Quotes_latest_data_symbol.forEach(x=> { console.log(x); });

  });
  sdk.quotes_historical_data("BITSTAMP_SPOT_BTC_USD", t, new Date(), 5).then(function (Quotes_historical_data) {
    console.log('Quotes_historical_data:');
    console.log('number: ', Quotes_historical_data.length);
    Quotes_historical_data.forEach(x=> { console.log(x); });

  });
  sdk.orderbooks_current_data_all().then(function (Orderbooks_current_data_all) {
    console.log('Orderbooks_current_data_all:');
    console.log('number: ', Orderbooks_current_data_all.length);
    Orderbooks_current_data_all.forEach(x=> { console.log(x); });

  });
  sdk.orderbooks_current_data_symbol("BITSTAMP_SPOT_BTC_USD").then(function (Orderbooks_current_data_symbol) {
    console.log('Orderbooks_current_data_symbol:');
    console.log(Orderbooks_current_data_symbol); 

  });
  sdk.orderbooks_latest_data("BITSTAMP_SPOT_BTC_USD", 5).then(function (Orderbooks_latest_data) {
    console.log('Orderbooks_latest_data:');
    console.log('number: ', Orderbooks_latest_data.length);
    Orderbooks_latest_data.forEach(x=> { console.log(x); });

  });
  sdk.orderbooks_historical_data("BITSTAMP_SPOT_BTC_USD", t, new Date(), 5).then(function (Orderbooks_historical_data) {
    console.log('Orderbooks_historical_data:');
    console.log('number: ', Orderbooks_historical_data.length);
    Orderbooks_historical_data.forEach(x=> { console.log(x); });

  });
}

run();
