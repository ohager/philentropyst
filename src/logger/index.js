const { StdoutLogger } = require('./stdoutLogger')
const { FileLogger } = require('./fileLogger')

class LoggerFactory {
  static create ({ logLevel, logfilePath }) {
    return logfilePath
      ? new FileLogger({ logfilePath, logLevel })
      : new StdoutLogger({ logLevel })
  }
}

module.exports = {
  LoggerFactory
}
