// validate call comes from transloadit
const crypto     = require('crypto');
const querystring = require('querystring');
const TRANSLOADIT_AUTH_SECRET = process.env.TRANSLOADIT_AUTH_SECRET;

// FUTURE: somehow validate that the payload originated from the same user as the user value in the payload. Like, in theory a user could log in with one account, submit their transloadit payload with the userID of another account, and their recording would go in there instead. Right?

const checkSignature = (fields, authSecret) => {
  const receivedSignature = fields.signature
  const payload           = fields.transloadit

  const calculatedSignature = crypto
    .createHmac('sha1', authSecret)
    .update(Buffer.from(payload, 'utf-8'))
    .digest('hex')

  return calculatedSignature === receivedSignature
}

// Fields to explicitly persist
// netlifyID (index)
// aws url of original upload
// aws url of transcoded audio
// name (default to filename)
// date created
// metadata object (duration, bitrate, etc)
// stringified request from transloadit


exports.handler = async (event, context) => {

  // DEBUG
  console.log(event.body);
  const transloaditPayload = event.body;
  const fields = querystring.parse(transloaditPayload);
  console.log("BREAK BREAK BREAK");
  console.log(JSON.stringify(JSON.parse(fields), null, 2));

  return {
    statusCode : 200,
  }
  // END DEBUG

  const { user } = JSON.parse(event.body);
  // console.log("New user signup:")
  console.log(JSON.stringify(user, null, 2));

  const netlifyID = user.id;

  const transloaditPayload = event.body;
  const fields = querystring.parse(transloaditPayload);

  // console.log("Non-Stringified");
  // console.log(event.body);
  // console.log(decodeURIComponent(event.body));
  // console.log(JSON.parse(decodeURIComponent(event.body)));
  // console.log("Stringified");
  // console.log(JSON.stringify(event.body.signature, null, 2));
  // console.log(JSON.stringify(event.body.transloadit, null, 2));
  // console.log("Checking signature...");

  try {
    console.log(JSON.stringify(JSON.parse(fields.transloadit), null, 2));
    console.log(fields.signature);
    console.log(fields.transloadit);
    console.log(checkSignature(fields, TRANSLOADIT_AUTH_SECRET));

    const netlify_id = netlifyID;
/*    
    const recording_name;
    const created_date;
    const transcoded_url;
    const original_url;
    const meta;
    const original_request;
*/
    // aws url of original upload
    // aws url of transcoded audio
    // name (default to filename)
    // date created
    // metadata object (duration, bitrate, etc)
    // stringified request from transloadit    
    console.log(`netlify_id: ${netlify_id}`)
  }
  catch (err) {
    console.log("error caught");
    console.log(err);
    return {
      statusCode : 200,
    }
  }

  if (!checkSignature(fields, TRANSLOADIT_AUTH_SECRET)) {
    return respond(res, 403, [
      `Error while checking signatures`,
      `No match so payload was tampered with, or an invalid Auth Secret was used`,
    ])
  };

  return {
    statusCode: 200,
  }

  // const form = new formidable.IncomingForm();
  // form.parse(event.body, (err, fields, files) => {
  //   if (err) {
  //     return respond(res, 500, [`Error while parsing multipart form`, err])
  //   };
  //   console.log(fields);
  //   return {
  //     statusCode: 200,
  //   };

    // if (!checkSignature(fields, process.env.AUTH_SECRET)) {
    //   return respond(res, 403, [
    //     `Error while checking signatures`,
    //     `No match so payload was tampered with, or an invalid Auth Secret was used`,
    //   ])
    // };
    // console.log(checkSignature(fields, TRANSLOADIT_AUTH_SECRET));
  // });
  
  // console.log(JSON.stringify(event, null, 2));
  // console.log(JSON.stringify(context, null, 2));
    // return {
    //   statusCode: 200,
    // }

  // if (context?.clientContext?.user) { // Verifies logged-in user
  //   // process the function
  //   const { identity, user } = context.clientContext;
  //   console.log("Upload Key request from user:");
  //   console.log(JSON.stringify(user, null, 2));
  //   console.log(JSON.stringify(identity, null, 2));
  //   console.log("Upload Key Request granted.");
  //   return {
  //     statusCode: 200,
  //     body: JSON.stringify({'TRANSLOADIT_KEY' : `${process.env.TRANSLOADIT_KEY}`, 'TRANSLOADIT_TEMPLATE_ID' : `${process.env.TRANSLOADIT_TEMPLATE_ID}`})
  //   }
  // } else {
  //   console.log("Upload Key Request denied.");
  //   console.log(JSON.stringify(event, null, 2));
  //   return {
  //     statusCode: 401,
  //     body: JSON.stringify('Unauthorized')
  //   }
  // }
}

// Create Fauna entry containing:
//  - userID
//  - aws recording url of original file and transcoded file(s) (may want make a low-fi mp3 version for preview streaming in the FE UI)
//  - timestamp
//  - other relevant metadata (perhaps a cache of the full JSON objects from the original call TO transloadit and this call FROM transloadit)

// Kick off transcription w/ transcription microservice. Use a Netlify background function. See https://docs.netlify.com/functions/build-with-javascript/

// Questions:
//  - What's the best way to alert the FE UI about the progress of these events?
//  - What's the best way to fire off the transcription request to my transcription microservice?
//  - Should transcription be automatic or a user-initiated event separate from file upload? (or maybe a form checkbox at upload time? transcribe immediately vs upload only? MVP I think is transcribe immediately...)

// IDEA: each user has a database "in-progress queue" object that's always empty unless there's a file actively in this pipeline. So the front-end can intermittently poll that object after the user initiates an upload, and at the completion of each step in the process, that object can be updated with the progress. e.g. transcoding finished, transcription in progress, transcription finished. The only question would be whether that queue object is simply emptied when everything is done, or whether a "completed" entry sticks around for a bit with metadata for the UI? But then how long does it stick around? And if it's never deleted then it defeats the purpose of a quick and easy object to poll. So maybe the queue only empties on success. So if the FE sees an empty queue object it knows the process was successful and can refresh the UI. And you can always have a manual "refresh" button for the user just in case the recording doesn't show up!