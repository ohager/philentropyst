const pino = require('pino')
const prettifier = require('pino-pretty')
const { Logger } = require('./logger')

class StdoutLogger extends Logger {
  constructor ({ logLevel }) {
    const logger = pino({
      level: logLevel,
      prettyPrint: { colorize: true },
      prettifier
    })
    super(logger)
  }
}

module.exports = {
  StdoutLogger
}
