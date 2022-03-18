const fetch = require("node-fetch");

async function fetchTest() {
  const result = await fetch(`https://api.coindesk.com/v1/bpi/currentprice.json`)
  .then(response => response.json())
  .then(j => console.log(j))
  .then(data => fetch(`https://api.coindesk.com/v1/bpi/currentprice.json`))
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.log(err))
}

fetchTest()