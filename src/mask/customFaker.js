const Prefix = 'custom.'

class CustomFaker {
  static isCustomType (type) {
    return type.startsWith(Prefix)
  }

  apply ({ type, options }) {
    const t = type.replace(Prefix, '')
    if (!this[t]) {
      throw Error(`Type '${type}' not supported`)
    }
    return this[t](options)
  }

  fixedValue (options) {
    return options
  }
}

module.exports = {
  CustomFaker
}
