exports.handler = (event, context) => {
  console.log('completedTranscriptionCallback');
  console.log(event);
  console.log(context);

  return {
    statusCode: 200,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({body : "hello, World via callback!"})
  }
}