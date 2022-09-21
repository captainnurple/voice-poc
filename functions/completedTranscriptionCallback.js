var faunadb = require("faunadb");
var q = faunadb.query;
var client = new faunadb.Client({
  secret: process.env.FAUNA_SERVER_KEY,
  domain: "db.us.fauna.com",
  queryTimeout: 30000,
});

const AWS_CALLBACK_KEY = process.env.API_GATE_CALLBACK_TO_NETLIFY_KEY;
const HTTPS_BUCKET_ROOT = `https://${process.env.S3_UPLOAD_BUCKET}.s3.us-west-1.amazonaws.com/`;

exports.handler = async (event, context) => {
  // console.log('completedTranscriptionCallback');
  // console.log('AWS_CALLBACK_KEY ', AWS_CALLBACK_KEY);
  // console.log(event);
  // console.log(context);
  // console.log(event.headers)
  // console.log(event.headers.hasOwnProperty('auth_key'))

  // Auth check
  const passed_key = event.headers.hasOwnProperty("auth_key")
    ? event.headers["auth_key"]
    : 0;
  // console.log("passed_key ", passed_key)
  if (passed_key != AWS_CALLBACK_KEY) {
    console.log("Auth Error. Returning 401.");
    return {
      statusCode: 401,
      body: JSON.stringify("Unauthorized request"),
    };
  }

  var lambda_body = JSON.parse(event.body);
  // console.log(lambda_body)
  const ssl_url =
    HTTPS_BUCKET_ROOT + lambda_body.keys[0].split(".")[0] + ".m4a";
  console.log("resource ssl url: ", ssl_url);

  const transcript = lambda_body.transcript;

  const result = await client
    .query(
      q.Call(q.Function("persist_transcript_by_ssl_url"), [ssl_url, transcript])
    )
    .then(function (res) {
      // console.log('Result: ', res);
    })
    .catch(function (err) {
      console.log("Fauna error: ", err);
    });
  // console.log('final result: ', result)

  let responseBody = {
    message: "Body test",
    input: "An input!",
  };

  let response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(responseBody),
  };
  console.log("response: ", JSON.stringify(response));

  return response;
};

// if it *isn't* the holy spirit, then yielding to the compulsive impulse will not, in fact, bring freedom and release from the guilty burden of my past, but rather will serve to strengthen and tighten the bondage of guilt within my heart. This is not a trivial matter.
// Surely the *extreme* bias of the OCD sufferer must be toward justification and non-acting surrender of the past into the mercy of Jesus blood.
