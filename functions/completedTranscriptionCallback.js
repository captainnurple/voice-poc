exports.handler = (event, context) => {
  console.log('completedTranscriptionCallback');
  console.log(event);
  console.log(context);

  return {
    statusCode: 200,
    body: JSON.stringify({'body' : "hello, World via callback!"})
  }
}