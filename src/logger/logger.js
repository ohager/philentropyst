const pino = require('pino')

let refCount = 0 // eslint-disable-line

class Logger {
  constructor (logger) {
    refCount += 1 // eslint-disable-line
    this._logger = logger
    this._initializeCleanupProcess()
  }

  _initializeCleanupProcess () {
    const handler = pino.final(this._logger, (err, finalLogger, evt) => {
      if (err) finalLogger.error(err, 'error caused exit')
      finalLogger.flush()
      process.exit(err ? 1 : 0)
    })
    process.on('beforeExit', () => handler(null, 'beforeExit'))
    process.on('exit', () => handler(null, 'exit'))
    process.on('uncaughtException', (err) => handler(err, 'uncaughtException'))
    process.on('SIGINT', () => handler(null, 'SIGINT'))
    process.on('SIGQUIT', () => handler(null, 'SIGQUIT'))
    process.on('SIGTERM', () => handler(null, 'SIGTERM'))
  }

  flush () {
    this._logger.flush()
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
