var faunadb = require('faunadb')
var q = faunadb.query

const TEMP_SERVER_KEY = 'fnAEfu2CM1AARr_nE73_Hr-qZ-DdizaK98slAhgg'

var client = new faunadb.Client({
  secret: TEMP_SERVER_KEY,
  domain: 'db.us.fauna.com'
})

// client.query(
//   q.ToDate('2018-06-06')
// )
// .then(function (res) { console.log('Result:', res) })
// .catch(function (err) { console.log('Error:', err) })

client.query(
  q.Call(q.Function("create_recording_by_netlifyID"), ["1", "testRecordingRemote 2", "http:wowzers"])
)
.then(function (res) { console.log('Result:', res) })
.catch(function (err) { console.log('Error:', err) })
