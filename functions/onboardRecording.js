// TODO: I think uploading multiple files at once breaks this. It appears as though transloadit may batch results in the notify_url w/ multiple uploads so I need to make the below iterate results.

// validate call comes from transloadit
const crypto     = require('crypto');
const querystring = require('querystring');
const jwt_decode = require('jwt-decode');
const fetch = require("node-fetch");
var faunadb = require('faunadb')
var q = faunadb.query

var client = new faunadb.Client({
  secret: process.env.FAUNA_SERVER_KEY,
  domain: 'db.us.fauna.com',
  queryTimeout: 30000,
})

const functionsURL =
  process.env.URL == "http://localhost:8888"
    ? "https://f7f1-76-170-96-113.ngrok.io"
    : "https://boring-varahamihira-cc7a90.netlify.app";

// FUTURE: somehow validate that the payload originated from the same user as the user value in the payload. Like, in theory a user could log in with one account, submit their transloadit payload with the userID of another account, and their recording would go in there instead. Right?

const TRANSLOADIT_AUTH_SECRET = process.env.TRANSLOADIT_AUTH_SECRET;

const checkSignature = (fields, authSecret) => {
  const receivedSignature = fields.signature
  const payload           = fields.transloadit

  const calculatedSignature = crypto
    .createHmac('sha1', authSecret)
    .update(Buffer.from(payload, 'utf-8'))
    .digest('hex')

  return calculatedSignature === receivedSignature
}

exports.handler = async (event, context) => {

  console.log('ONBOARD RECORDING');
  // console.log(process.env);

  const transloaditPayload = event.body;
  const fields = querystring.parse(transloaditPayload);

  if (!checkSignature(fields, TRANSLOADIT_AUTH_SECRET)) {
    return respond(res, 403, [
      `Error while checking signatures`,
      `No match so payload was tampered with, or an invalid Auth Secret was used`,
    ])
  };

  try {
    const tlPayload = JSON.parse(fields.transloadit)
    console.log('TL PAYLOAD');
    console.log(tlPayload);
    // Extract netlifyID from jwt
    const decodedJWT = jwt_decode(tlPayload.fields.netlifyUserToken);
    const netlifyID = decodedJWT.sub;
    // console.log(netlifyID)

    /*
    attempt to hit fauna
    */

    const result = await client.query(
      q.Call(q.Function("onboard_recording_by_netlifyID"), [netlifyID, tlPayload])
    )
    .then(function (res) {
      console.log('Result:', res);
    })
    .catch(function (err) { 
      console.log('Fauna Error:', err);
      // return {
      //   statusCode : 200,
      // }
    })
    .then(data => {
      return fetch(`${functionsURL}/.netlify/functions/initializeTranscriptionAWS/`, {
        method: 'POST',
        body: JSON.stringify({
          key: tlPayload['results'][':original'][0]['ssl_url']
        })
      })
    })
    .then(res => {
        console.log('initializeTranscriptionAWS result: ', res)
      })
    .catch(function (err){
        console.log('Error hitting initializeTranscriptionAWS:', err);
      })
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


// Kick off transcription w/ transcription microservice. Use a Netlify background function. See https://docs.netlify.com/functions/build-with-javascript/

// Questions:
//  - What's the best way to alert the FE UI about the progress of these events?
//  - What's the best way to fire off the transcription request to my transcription microservice?
//  - Should transcription be automatic or a user-initiated event separate from file upload? (or maybe a form checkbox at upload time? transcribe immediately vs upload only? MVP I think is transcribe immediately...)

// IDEA: each user has a database "in-progress queue" object that's always empty unless there's a file actively in this pipeline. So the front-end can intermittently poll that object after the user initiates an upload, and at the completion of each step in the process, that object can be updated with the progress. e.g. transcoding finished, transcription in progress, transcription finished. The only question would be whether that queue object is simply emptied when everything is done, or whether a "completed" entry sticks around for a bit with metadata for the UI? But then how long does it stick around? And if it's never deleted then it defeats the purpose of a quick and easy object to poll. So maybe the queue only empties on success. So if the FE sees an empty queue object it knows the process was successful and can refresh the UI. And you can always have a manual "refresh" button for the user just in case the recording doesn't show up!