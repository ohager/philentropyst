const { ensureFileSync, writeJsonSync, readJsonSync } = require('fs-extra')

class FileCache {
  constructor ({ fileName, logger }) {
    this._fileName = fileName
    this._logger = logger
    this._data = {}
  }

  loadSync () {
    this._logger.info(`Loading cache - ${this._fileName}`)
    ensureFileSync(this._fileName)
    try {
      this._data = readJsonSync(this._fileName)
    } catch (e) {
      this._data = {}
    }
  }

  saveSync () {
    this._logger.info(`Saving cache - ${this._fileName}`)
    writeJsonSync(this._fileName, this._data)
  }

  setValue (key, value) {
    this._data[key] = value
  }

  getValue (key) {
    return this._data[key]
  }
}

module.exports = {
  FileCache
}
