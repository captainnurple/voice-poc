const {hello_dbUtils} = require('./dbUtils')

exports.handler = (event, context) => {
  hello_dbUtils()
  return {
    statusCode: 200,
    body: "hello, World over tunnel!"
  }
}