const querystring = require('querystring');
// const fetch = require("node-fetch");
var faunadb = require('faunadb')
var q = faunadb.query

var client = new faunadb.Client({
  secret: process.env.FAUNA_SERVER_KEY,
  domain: 'db.us.fauna.com',
  queryTimeout: 30000,
})

// TODO FUTURE: somehow validate that the payload originated from the same user as the user value in the payload. Like, in theory a user could log in with one account, submit their transloadit payload with the userID of another account, and their recording would go in there instead. Right?

exports.handler = async (event, context) => {
  console.log('derp')
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     transcriptStatus : "pending"
  //   })
  // }

  if (!context?.clientContext?.user) { // Verifies logged-in user
    console.log("Fetch Recording Updates Request denied.");
    // console.log(JSON.stringify(event, null, 2));
    return {
      statusCode: 401,
      body: JSON.stringify('Unauthorized')
    }
  }

  const { user } = context.clientContext;

  // console.log('FETCH RECORDING UPDATES');
  // console.log(context);
  // console.log(event);
  const body = JSON.parse(event.body);

  // console.log(`user.id: ${user.sub}`)
  // console.log(`body: ${body}`)
  // console.log(`filePrefix: ${body.filePrefix}`)
  const netlifyID = user.sub;

  var results = {};

  try {
    /*
    attempt to hit fauna
    */
    const result = await client.query(
      // q.Call(q.Function("fetch_rec_updates_by_file_prefix"), ["cb27daef_4bfc_4f69_9d44_113e4605bad2__1648486133241", "cb27daef-4bfc-4f69-9d44-113e4605bad2"])
      q.Call(q.Function("rec_update_for_file_prefix"), [body.filePrefix])
    )
    .then(function (res) {
      console.log('Result:', JSON.stringify(res, null, 2));
      console.log(res[0].status);
      if(res[0].status == 'complete' && res[0].hasOwnProperty('transcript')) {
        const resDate = res[0]["date"];
        const resTitle = res[0]["title"];
        // console.log([res[0][0][1]["date"], res[0][0][0]["title"]]);
        // console.log(Buffer.from(JSON.stringify([res[0][0]["fileData"]["data"]["date"],res[0][0]["fileData"]["data"]["title"]])).toString("base64"))
        results = {
          status : "complete",
          date: resDate,
          cursor : Buffer.from(JSON.stringify([resDate,resTitle])).toString("base64"),          
          transcript : res[0]["transcript"]
        }
        // console.log(results);
      } else if (res[0].status == 'transcribing'){
        results = {
          status : "transcribing",
        }
      } else {
        results = {
          status : "DNE",
        }
      }
    })
    .catch(function (err) { 
      console.log('Fauna Fetch Error:', err);
      return {
        statusCode : 200,
        body: JSON.stringify(err)
      }
    })
    console.log("final result: ", result)
  }
  catch (err) {
    console.log("error caught");
    console.log(err);
    return {
      statusCode : 200,
      body: JSON.stringify(err)
    }
  }

  console.log(results);
  console.log(JSON.stringify(results));
  return {
    statusCode: 200,
    body: JSON.stringify(results)
  }

}