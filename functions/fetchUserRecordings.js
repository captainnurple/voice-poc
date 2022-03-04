// paginated fetch for lots of recordings
// way to check just for changes to a single recording (i.e. waiting for transcription to be completed and updated)


const querystring = require('querystring');
const fetch = require("node-fetch");
var faunadb = require('faunadb')
var q = faunadb.query

var client = new faunadb.Client({
  secret: process.env.FAUNA_SERVER_KEY,
  domain: 'db.us.fauna.com'
})

// FUTURE: somehow validate that the payload originated from the same user as the user value in the payload. Like, in theory a user could log in with one account, submit their transloadit payload with the userID of another account, and their recording would go in there instead. Right?

exports.handler = async (event, context) => {

  /// END LOCAL TESTING

  // if (!context?.clientContext?.user) { // Verifies logged-in user
  //   console.log("User Recordings Request denied.");
  //   console.log(JSON.stringify(event, null, 2));
  //   return {
  //     statusCode: 401,
  //     body: JSON.stringify('Unauthorized')
  //   }
  // }

  console.log('FETCH USER RECORDINGS');
  // console.log(process.env);
  const payload = event.body;
  const fields = querystring.parse(payload);

  const { user } = context?.clientContext?.user;
  const netlifyID = user.id;

  var after = [];
  if('after' in fields) {
    after = fields.after;
  }

  try {
    /*
    attempt to hit fauna
    */
   after = [];
    client.query(
      q.Call(q.Function("fetch_recordings_by_netlifyID"), [netlifyID, after])
    )
    .then(function (res) {
      console.log('Result:', res);
    })
    .catch(function (err) { 
      console.log('Error:', err);
      // return {
      //   statusCode : 200,
      // }
    })
    /*
    end hit attempt
    */
  }
  catch (err) {
    console.log("error caught");
    console.log(err);
    return {
      statusCode : 200,
    }
  }

  return {
    statusCode: 200,
  }

}