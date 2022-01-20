exports.handler = async (event) => {
  const { user } = JSON.parse(event.body);
  console.log(JSON.stringify(user, null, 2));

  return {
    statusCode: 200,
    // body: JSON.stringify({ app_metadata: { roles: ["user"] } }), // Optional metadata args; see docs
  };
};