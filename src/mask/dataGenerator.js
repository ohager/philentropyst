const faker = require('faker')
const { CustomFaker } = require('./customFaker')
const isNumericType = type => /number|amount|float/ig.test(type)

class DataGenerator {
  constructor (schema) {
    this._schema = schema
    this._customFaker = new CustomFaker()
    this._groupedData = {}
  }

  generate (field, groupId = null) {
    if (!this._schema.csv.group) {
      return this._generateNewData(field)
    }

    const fieldIsGrouped = this._schema.csv.group.fields.includes(field.ref)

    if (!(groupId && fieldIsGrouped)) {
      return this._generateNewData(field)
    }

    const data = this._getFromGroup(groupId) || {}
    if (!data[field.ref]) {
      data[field.ref] = this._generateNewData(field)
      // data = this._schema.csv.group.fields.reduce((acc, f) => {
      //   return { ...acc, [f]: this._generateNewData(field) }
      // }, {})
      this._setToGroup(groupId, data)
    }
    return data[field.ref]
  }

  _generateNewData ({ type, options }) {
    const params = options ? JSON.stringify(options) : null
    let data
    if (CustomFaker.isCustomType(type)) {
      data = this._customFaker.apply({ type, options: params })
    } else {
      data = faker.fake(`{{${type}${params ? `(${params})` : ''}}}`)
    }

    return isNumericType(type) ? parseFloat(data) : data
  }

  _getFromGroup (groupId) {
    return this._groupedData[groupId]
  }

  _setToGroup (groupId, data) {
    this._groupedData[groupId] = data
  }
}

module.exports = {
  DataGenerator
}
