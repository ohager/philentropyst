const pino = require('pino')
const { Logger } = require('./logger')

class FileLogger extends Logger {
  constructor ({ logfilePath, logLevel }) {
    const destination = pino.destination({
      dest: logfilePath,
      minLength: 4096,
      sync: false
    })

    const logger = pino({
      level: logLevel
    }, destination)

    super(logger)

    setInterval(function () {
      this._logger.flush()
    }, 5000).unref()
  }
}

module.exports = {
  FileLogger
}
