
var getLocal = function() {
  var date = ''
  var newDate = new Date()
      date = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
      date = new Date(date).toDateString()
      console.log(date)
  return date
}

exports.getLocal = getLocal