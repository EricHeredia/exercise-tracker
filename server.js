const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI || "mongodb://EricHeredia:asdf1234@ds213832.mlab.com:13832/cloudbase", {useMongoClient: true} );

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// test
app.get('/api/test', (req, res) => {
  res.send('Working!')
})

//------------------------------------------------------------

var Schema = mongoose.Schema
var accSchema = new Schema({
  username: String,
  exercises: Object
})
var UsrAcc = mongoose.model('UsrAcc', accSchema)

// Create new user
app.post('/api/exercise/new-user', (req, res) => {
  var username = req.body.username
  res.send(username)

  var usrAcc = new UsrAcc({
    username: username
  })

  usrAcc.save()
})

// Add exercises
app.post('/api/exercise/add', (req, res) => {
  var userId = req.body.userId
  var description = req.body.description
  var duration = req.body.duration
  var date = req.body.date

  res.send(userId + ' ' + description + ' ' + duration + ' ' + date)
})

// Get logs
app.get('/api/exercise/log?:usrId', (req, res) => {
  var usrId = req.query

  UsrAcc.find(usrId[0], (err, data) => {
    res.json(data)
  })
})




//------------------------------------------------------------

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
