const faker = require('faker')
const { CustomFaker } = require('./customFaker')
const isNumericType = type => /number|amount|float/ig.test(type)

const customFaker = new CustomFaker()

function generateData ({ type, options }) {
  const params = options ? JSON.stringify(options) : null
  let data
  if (CustomFaker.isCustomType(type)) {
    data = customFaker.apply({ type, options: params })
  } else {
    data = faker.fake(`{{${type}${params ? `(${params})` : ''}}}`)
  }

  return isNumericType(type) ? parseFloat(data) : data
}

module.exports = {
  generateData
}
