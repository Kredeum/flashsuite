import axios from 'axios';
import fs from 'fs';

async function graphQL(url, query) {
  let response;
  try { response = await axios.post(url, { query: query }); }
  catch (error) { console.error(error); }
  return response;
}

const queryFile = process.argv[2] || "flashsuite.gql";
const url = process.argv[3] || 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-kovan';
const query = fs.readFileSync(queryFile, "utf8");

graphQL(url, query).then((res) => {  console.log(JSON.stringify(res.data, null, "  "));  });
