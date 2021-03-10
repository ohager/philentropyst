const pino = require('pino')
const prettifier = require('pino-pretty')

class Logger {
  constructor ({ logfilePath, logLevel }) {
    const destination = logfilePath
      ? pino.destination({
        dest: logfilePath,
        minLength: 4096,
        sync: false
      })
      : pino.destination(1)
    this._logger = pino(
      {
        level: logLevel,
        prettyPrint: { colorize: true },
        prettifier,
      },
      destination)
  }

  info (msg) {
    this._logger.info(msg)
  }

  debug (msg) {
    this._logger.debug(msg)
  }

  error (msg) {
    this._logger.error(msg)
  }

  warn (msg) {
    this._logger.warn(msg)
  }

}

module.exports = {
  Logger
}
