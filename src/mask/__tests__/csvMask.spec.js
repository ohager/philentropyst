/* globals describe, it, expect */
const { readFileSync, createReadStream } = require('fs')
const path = require('path')
const yaml = require('yaml')
const CsvReadableStream = require('csv-reader')
const { LoggerFactory } = require('../../logger')
const { maskCsv } = require('../csvMask')

function readSchema (schemaPath) {
  const schema = readFileSync(schemaPath, 'utf-8')
  return yaml.parse(schema)
}

function buildCsvOptionsBySchema (schema) {
  const s = schema.csv
  return {
    delimiter: s.delimiter,
    multiline: s.multiline,
    allowQuotes: s.allowQuotes,
    wrapStringInQuotes: s.wrapStringInQuotes,
    parseNumbers: s.parseNumbers,
    parseBooleans: s.parseBooleans,
    trim: s.trim,
    cache: s.cache
  }
}

function readCsvLines ({ path, schema }) {
  const readCsv = new CsvReadableStream(buildCsvOptionsBySchema(schema))
  const lines = []
  return new Promise((resolve, reject) => {
    createReadStream(path, 'utf8')
      .pipe(readCsv)
      .on('data', (line) => lines.push(line))
      .on('end', () => {
        resolve(lines)
      })
  })
}

const logger = LoggerFactory.create({ logLevel: 'info' })

describe('csvMask Integration Tests', () => {
  describe('Grouping', () => {
    it('should group data as expected', async () => {
      const schemaPath = path.join(__dirname, './__data/grouped.data.schema.yml')
      const inputPath = path.join(__dirname, './__data/grouped.data.csv')
      const outputPath = path.join(__dirname, './__data/grouped.data.masked.csv')
      const { schema } = readSchema(schemaPath)
      await maskCsv({
        input: inputPath,
        output: outputPath,
        schema,
        logger
      })

      const lines = await readCsvLines({ path: outputPath, schema })
      // skip header
      const line1 = lines[1]
      const line2 = lines[2]
      const line3 = lines[3]
      const line4 = lines[4]
      const line5 = lines[5]

      expect(line1[0]).toBe('1')
      expect(line1[1]).toBe('1')
      expect(line1[2]).not.toBe('oliver')
      expect(line1[3]).not.toBe('mueller')
      expect(line1[4]).not.toBe('5463-1755-1831-1157')
      expect(line1[5]).not.toBe('7878837')
      expect(line1[6]).toBe('sku-1234')
      expect(line1[7]).toBe('4')

      expect(line2[0]).toBe('2')
      expect(line2[1]).toBe('1')
      expect(line1[2]).toBe(line2[2])
      expect(line1[3]).toBe(line2[3])
      expect(line1[4]).toBe(line2[4])
      expect(line1[5]).not.toBe(line2[5])

      expect(line3[0]).toBe('3')
      expect(line3[1]).toBe('1')
      expect(line2[2]).toBe(line3[2])
      expect(line2[3]).toBe(line3[3])
      expect(line2[4]).toBe(line3[4])
      expect(line2[5]).not.toBe(line3[5])

      expect(line4[0]).toBe('4')
      expect(line4[1]).toBe('2')
      expect(line4[2]).not.toBe('peter')
      expect(line4[3]).not.toBe('meier')
      expect(line4[4]).not.toBe('6771-8936-6416-5455')
      expect(line4[5]).not.toBe('7643552')
      expect(line4[6]).toBe('sku-0012')
      expect(line4[7]).toBe('42')

      expect(line5[0]).toBe('5')
      expect(line5[1]).toBe('2')
      expect(line4[2]).toBe(line5[2])
      expect(line4[3]).toBe(line5[3])
      expect(line4[4]).toBe(line5[4])
      expect(line4[5]).not.toBe(line5[5])
    })
  })

  describe('Common', () => {
    it('should mask data as expected', async () => {
      const schemaPath = path.join(__dirname, './__data/nongrouped.data.schema.yml')
      const inputPath = path.join(__dirname, './__data/nongrouped.data.csv')
      const outputPath = path.join(__dirname, './__data/nongrouped.data.masked.csv')

      const { schema } = readSchema(schemaPath)
      await maskCsv({
        input: inputPath,
        output: outputPath,
        schema,
        logger
      })

      const lines = await readCsvLines({ path: outputPath, schema })
      // skip header
      const line1 = lines[1]
      const line2 = lines[2]
      expect(line1[0]).toBe('1')
      expect(line1[1]).not.toBe('oliver')
      expect(line1[2]).not.toBe('mueller')
      expect(line1[3]).not.toBe('5463-1755-1831-1157')
      expect(line1[4]).not.toBe('7878837')
      expect(line1[5]).toBe('sku-1234')
      expect(line1[6]).toBe('4')

      expect(line2[0]).toBe('2')
      expect(line2[1]).not.toBe('peter')
      expect(line2[2]).not.toBe('meier')
      expect(line2[3]).not.toBe('6771-8936-6416-5455')
      expect(line2[4]).not.toBe('7643552')
      expect(line2[1]).not.toBe(line1[1])
      expect(line2[2]).not.toBe(line1[2])
      expect(line2[3]).not.toBe(line1[3])
      expect(line2[4]).not.toBe(line1[4])
      expect(line2[5]).toBe('sku-7765')
      expect(line2[6]).toBe('890')
    })
  })
  describe('Caching', () => {
    it('should cache data as expected', async () => {
      const schemaPath = path.join(__dirname, './__data/cached.data.schema.yml')
      const inputPath = path.join(__dirname, './__data/cached.data.csv')
      const outputPath = path.join(__dirname, './__data/cached.data.masked.csv')

      const { schema } = readSchema(schemaPath)
      await maskCsv({
        input: inputPath,
        output: outputPath,
        schema,
        logger
      })

      const lines = await readCsvLines({ path: outputPath, schema })
      // skip header
      const line1 = lines[1]
      const line2 = lines[2]
      const line3 = lines[3]
      expect(line1[0]).toBe('1')
      expect(line1[1]).not.toBe('oliver')
      expect(line1[2]).not.toBe('mueller')
      expect(line1[3]).not.toBe('5463-1755-1831-1157')
      expect(line1[4]).not.toBe('7878837')
      expect(line1[5]).toBe('sku-1234')
      expect(line1[6]).toBe('4')

      expect(line2[0]).toBe('2')
      expect(line2[1]).not.toBe('peter')
      expect(line2[2]).not.toBe('meier')
      expect(line2[3]).not.toBe('6771-8936-6416-5455')
      expect(line2[4]).not.toBe('7643552')
      expect(line2[1]).not.toBe(line1[1])
      expect(line2[2]).not.toBe(line1[2])
      expect(line2[3]).not.toBe(line1[3])
      expect(line2[4]).not.toBe(line1[4])
      expect(line2[5]).toBe('sku-7765')
      expect(line2[6]).toBe('890')

      expect(line3[0]).toBe('3')
      expect(line3[1]).toBe(line1[1])
      expect(line3[2]).toBe(line1[2])
      expect(line3[3]).toBe(line1[3])
      expect(line3[4]).not.toBe(line1[4])
      expect(line3[5]).not.toBe(line1[5])
      expect(line3[6]).not.toBe(line1[6])

    })
  })
})
