/* globals describe, it, expect */

const { CustomFaker } = require('../customFaker')

describe('CustomFaker', () => {
  const customFaker = new CustomFaker()

  describe('apply', () => {
    it('should throw error for unknown method/type', () => {
      expect(() => {
        customFaker.apply({ type: 'foobar', options: 'value' })
      }).toThrow('Type \'foobar\' not supported')
    })

    describe('fixedValue', () => {
      it('should apply data for known method/type', () => {
        const data = customFaker.apply({ type: 'fixedValue', options: 'XXXXX' })
        expect(data).toBe('XXXXX')
      })
    })
  })
})
