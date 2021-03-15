/* globals describe, it, expect */

const { DataGenerator } = require('../dataGenerator')

const SchemaWithGroup = {
  csv: {
    group: {
      ref: 'groupId',
      fields: ['firstName', 'lastName', 'dob']
    }
  },
  masks: [
    {
      ref: 'firstName',
      type: 'name.firstName'
    },
    {
      ref: 'lastName',
      type: 'name.lastName'
    },
    {
      ref: 'dob',
      type: 'name.firstName'
    },
    {
      ref: 'groupIndependentId',
      type: 'random.number',
      options: {
        min: 100000,
        max: 999999
      }
    }
  ]
}

const SchemaSimple = {
  csv: {},
  masks: [
    {
      ref: 'firstName',
      type: 'name.firstName'
    },
    {
      ref: 'lastName',
      type: 'name.lastName'
    },
    {
      ref: 'dob',
      type: 'date.past'
    }
  ]
}

describe('DataGenerator', () => {
  describe('generate', () => {
    it('should generate new data for non-grouped fields', () => {
      const dataGenerator = new DataGenerator(SchemaSimple)

      SchemaSimple.masks.forEach(field => {
        const data1 = dataGenerator.generate(field)
        const data2 = dataGenerator.generate(field)

        expect(data1).toBeDefined()
        expect(data2).toBeDefined()
        expect(data1).not.toBe(data2)
      })
    })

    it('should generate new data for grouped fields', () => {
      const dataGenerator = new DataGenerator(SchemaWithGroup)
      SchemaWithGroup.masks.forEach(field => {
        const data1 = dataGenerator.generate(field, '1')
        const data2 = dataGenerator.generate(field, '1')

        expect(data1).toBeDefined()
        expect(data2).toBeDefined()
        if (field.ref !== 'groupIndependentId') {
          expect(data1).toEqual(data2)
        } else {
          expect(data1).not.toBe(data2)
        }
      })
    })
  })
})
