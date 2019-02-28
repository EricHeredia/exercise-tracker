module.exports = {
  getLocal: function() {
    var date = ''
    var newDate = new Date()
        console.log(newDate)
        console.log(newDate.getTime())
        console.log(newDate.getTimezoneOffset())
        console.log(newDate.getTime() + ' - ' + newDate.getTimezoneOffset() + ' * 60000')
        date = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
        console.log(date)
        date = new Date(date).toDateString()
        console.log(date)
        return date
  }
}