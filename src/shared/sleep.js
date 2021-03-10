const sleep = timeoutMillies => new Promise(resolve => {
  setTimeout(resolve, timeoutMillies)
})

module.exports = {
  sleep
}
