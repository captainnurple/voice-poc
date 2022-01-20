exports.handler = async (event, context) => {
  if (context?.clientContext?.user) { // Verifies logged-in user
    // process the function
    const { identity, user } = context.clientContext;
    console.log("Template ID request from user:");
    console.log(JSON.stringify(user, null, 2));
    console.log(JSON.stringify(identity, null, 2));
    console.log("Template ID Request granted.");
    return {
      statusCode: 200,
      body: JSON.stringify(process.env.TRANSLOADIT_TEMPLATE_ID)
    }
  } else {
    console.log("Template ID Request denied.");
    console.log(JSON.stringify(event, null, 2));
    return {
      statusCode: 401,
      body: JSON.stringify('Unauthorized')
    }
  }
}