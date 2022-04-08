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

  if (!context?.clientContext?.user) { // Verifies logged-in user
    console.log("Fetch Recording Updates Request denied.");
    console.log(JSON.stringify(event, null, 2));
    return {
      statusCode: 401,
      body: JSON.stringify('Unauthorized')
    }
  }

  const { user } = context.clientContext;

  console.log('FETCH RECORDING UPDATES');
  console.log(context);
  console.log(event);
  const payload = event.body;
  const fields = querystring.parse(payload);

  // console.log(JSON.parse(fields))
  console.log(`user.id: ${user.sub}`)
  const netlifyID = user.sub;

  var results = {};

  try {
    /*
    attempt to hit fauna
    */
    const result = await client.query(
      q.Call(q.Function("fetch_rec_updates_by_file_prefix"), [fields.filePrefix, netlifyID])
    )
    .then(function (res) {
      console.log('Result:', res);
      if(res.length > 0 && res[0].hasOwnProperty('data')) {
        results = {
          data : res[0].data
        }
      }
    })
    .catch(function (err) { 
      console.log('Fauna Fetch Error:', err);
      // return {
      //   statusCode : 200,
      // }
    })
    console.log("final result: ", result)
  }
  catch (err) {
    console.log("error caught");
    console.log(err);
    return {
      statusCode : 200,
    }
  }

  return {
    statusCode: (results.hasOwnProperty('data') ? 200 : 200),
    body: (results.hasOwnProperty('data') ? JSON.stringify(results) : JSON.stringify({status : 'pending'}))
  }

}