const { StdoutLogger } = require('./stdoutLogger')
const { FileLogger } = require('./fileLogger')

class LoggerFactory {
  static create ({
    logLevel,
    logfilePath
  }) {
    if (logfilePath) {
      return new FileLogger({ logfilePath, logLevel })
    }

    return new StdoutLogger({
      logLevel
    })
  }
}

module.exports = {
  LoggerFactory
}
