const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const shortid = require('shortid')
const getLocalTime = require('./getTime')

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

// Create schema and subschema
var Schema = mongoose.Schema
var subSchema = new Schema({
  description: String,
  duration: String,
  date: String
}, {_id: false})
var accSchema = new Schema({
  username: String,
  _id: {
    'type': String,
    'default': shortid.generate
  },
  exercises: [subSchema]
})
var UsrAcc = mongoose.model('UsrAcc', accSchema)

// Create new user
app.post('/api/exercise/new-user', (req, res) => {
  var username = req.body.username
  
  // Check if username taken
  UsrAcc.findOne({username: username}, (err, data) => {
    if(data) {
      res.send('Username already taken')
    } else {

      // Create username
      var usrAcc = new UsrAcc({
        username: username
      })
    
      usrAcc.save()
      res.json({username: username, _id: usrAcc.id})
    }
  })
})

// Get logs form
app.post('/api/exercise/get-log', (req, res) => {
  newLink = '/api/exercise/log?userId='
  newLink += req.body.lUserId
  if (req.body.lFrom) { newLink += '&from=' + req.body.lFrom }
  if (req.body.lTo) { newLink += '&to=' + req.body.lTo }
  if (req.body.lLimit) { newLink += '&limit=' + req.body.lLimit }
  res.redirect(newLink)
})

// Add exercises
app.post('/api/exercise/add', (req, res) => {
  var userId = req.body.userId
  var description = req.body.description
  var duration = req.body.duration
  var date = req.body.date
  if (date === '') { 
    // var newDate = new Date()
    // console.log(newDate)
    // console.log(newDate.getTime())
    // console.log(newDate.getTimezoneOffset())
    // console.log(newDate.getTime() + ' - ' + newDate.getTimezoneOffset() + ' * 60000')
    // date = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
    // console.log(date)
    // date = new Date(date).toDateString()
    // console.log(date)
    date = getLocalTime.getLocal()
    console.log(getLocalTime.getLocal())
  } else {
    date = new Date(date + ' ').toDateString()
  }
  
  if (userId == "" || description == "" || duration == "") {
    // required fields not filled
    res.send('Please fill all required fields.')
  } else {
    if (date === 'Invalid Date') {
      res.send('Invalid Date, Please enter a correct date!')
    } else {
      var newExercise = {date: date, description: description, duration: duration}
    
      UsrAcc.findByIdAndUpdate(userId, {$push: {exercises: newExercise}}, (err, user) => {
        if(err){
          console.log(err)
        }
        if (user === null) {
          res.send('User not found!')
        } else {
          res.json({username: user.username, description: description, duration: duration, _id: userId, date: date})
        }
      })
    }
  }
})

// Get logs
app.get('/api/exercise/log', (req, res) => {
  var usrId = req.query.userId
  var from = req.query.from
  var to = req.query.to
  var limit = req.query.limit

  UsrAcc.findById(usrId, (err, data) => {
    // Check if valid user Id
    if (data === null){
      res.send('User Id not found!')
    } else {

      // Build log output
      var logOutput = {}
      logOutput._id = usrId
      logOutput.username = data.username
      var log = []

      if (from || to) {
        log = data.exercises
        if(from) { 
          logOutput.from = new Date(from + ' ').toDateString()
          log = log.filter((exercise) => {
            if (new Date(exercise.date) >= new Date(logOutput.from)) {
              return exercise
            }
          })
        }
        if(to) { 
          logOutput.to = new Date(to + ' ').toDateString()
          log = log.filter((exercise) => {
            if (new Date(exercise.date) <= new Date(logOutput.to)) {
              return exercise
            }
          })
          log.sort((a, b) => {
            return new Date(a.date) - new Date(b.date)
          })
        }
        if(limit) {
          log = log.splice(0, limit)
        }
      } else {
        log = data.exercises.sort((a, b) => {
          return new Date(a.date) - new Date(b.date)
        })
        if(limit) {
          log.splice(0, limit)
        }
      }

      logOutput.count = log.length
      logOutput.log = log


      res.json(logOutput)
    }
  })
})

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
