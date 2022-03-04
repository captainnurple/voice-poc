const fetch = require("node-fetch");

exports.handler = async (event, context) => {

  console.log('INITIALIZE TRANSCRIPTION AWS');
  console.log(JSON.parse(event.body).key);
  // console.log(context);

  const url = new URL(JSON.parse(event.body).key);
  const key = url.pathname.substring(1);
  console.log(key);

  const response = await fetch(`${process.env.API_GATE_INIT_TRANSCRIBE_ENDPOINT}`, {
    method: "POST",
    headers: {
      auth_key: `${process.env.API_GATE_TRANSCRIBE_KEY}`,
    },
    body: JSON.stringify({
      bucket: `${process.env.S3_UPLOAD_BUCKET}`,
      key: `${key}`
    }),
  })
    .then((res) => {
      console.log('response received')
      return res.json()})
    .then(jsonData => {
      console.log(jsonData)
    })
    .catch((err) => console.error(JSON.stringify(err, null, 2)));

  return {
    statusCode: 200,
    body: "hello, API GATEWAY success?"
  }

}