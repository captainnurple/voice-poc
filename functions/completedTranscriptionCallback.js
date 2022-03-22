exports.handler = (event, context) => {
  console.log('completedTranscriptionCallback');
  console.log(event);
  console.log(context);

  let responseBody = {
    message: "Hello, World",
    input: "A thing!"
  };

  let response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(responseBody)
  };
  console.log("response: ", JSON.stringify(response))

  return response;
}