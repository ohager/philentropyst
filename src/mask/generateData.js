const faker = require('faker')

const isNumericType = type => /number|amount|float/ig.test(type)

function generateData ({ type, options }) {
  const params = options ? JSON.stringify(options) : null
  const data = faker.fake(`{{${type}${params ? `(${params})` : ''}}}`)
  return isNumericType(type) ? parseFloat(data) : data
}

module.exports = {
  generateData
}
