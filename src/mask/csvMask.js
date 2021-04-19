const { EOL } = require('os')
const { join } = require('path')
const { createReadStream, createWriteStream } = require('fs')
const CsvReadableStream = require('csv-reader')
const AutoDetectDecoderStream = require('autodetect-decoder-stream')
const { DataGenerator } = require('./dataGenerator')
const { FileCache } = require('../cache/fileCache')
const murmurhash = require('murmurhash')

// for murmurhash
global.TextEncoder = require('util').TextEncoder

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

function normalizeString (str) {
  return typeof (str) === 'string'
    ? str.trim().toLowerCase().replace(/"/ig, '')
    : str
}

const wrapInQuotes = str => `"${str}"`

function maskLine ({ schema, logger, writer, line, fieldMap, chunk, generator, cache }) {
  const csv = schema.csv
  const masks = schema.masks
  const isHeader = schema.csv.hasHeader && line === 1

  let groupId
  if (schema.csv.group) {
    const groupRef = normalizeString(schema.csv.group.ref)
    const groupIdIndex = fieldMap[groupRef].index
    groupId = chunk[groupIdIndex]
  }

  masks
    .forEach(({ field }) => {
      const ref = normalizeString(field.ref)
      const fieldIndex = csv.hasHeader ? fieldMap[ref].index : parseInt(ref, 10)
      if (!isHeader && !Number.isNaN(fieldIndex) && fieldIndex < chunk.length) {
        let value
        if (fieldMap[ref].cached) {
          const originalValue = chunk[fieldIndex]
          const key = murmurhash.v3(`${fieldIndex}-${originalValue}`)
          const cachedValue = cache.getValue(key)
          value = cachedValue || generator.generate(field, groupId)
          if (!cachedValue) {
            cache.setValue(key, value)
          }
        } else {
          value = generator.generate(field, groupId)
        }
        chunk[fieldIndex] = value
      }
    })

  const processedChunk = chunk
    .map(v => typeof (v) === 'string' && csv.wrapStringInQuotes
      ? wrapInQuotes(v.replace(/"/ig, ''))
      : v
    )
    .join(csv.delimiter)

  writer.write(processedChunk, 'utf8')
  writer.write(EOL, 'utf8')
  logger.debug(`Processed line ${line}`)
}

function buildFieldMap ({ schema, header, logger }) {
  const fieldMap = {}
  const masksRefs = schema.masks.map(({ field }) => normalizeString(field.ref))
  const cacheRefs = schema.csv.cache && schema.csv.cache.fields.map((field) => normalizeString(field))
  if (schema.csv.group) {
    masksRefs.push(schema.csv.group.ref)
  }

  if (schema.csv.hasHeader) {
    masksRefs.forEach(ref => {
      if (!header.includes(ref)) {
        logger.warn(`Header does not contain field '${ref}'`)
      }
    })
    header.forEach((column, index) => {
      const cached = cacheRefs.includes(column)
      fieldMap[normalizeString(column)] = {
        index,
        cached
      }
    })
  } else {
    masksRefs.forEach(ref => {
      const index = parseInt(ref, 10)
      const cached = schema.csv.cache && schema.csv.cache.includes(ref)
      if (Number.isNaN(index) || index < 0 || index >= header.length) {
        logger.warn(`Invalid numeric ref '${ref}' (must be between 0 and ${header.length - 1})`)
      } else {
        fieldMap[index] = {
          index,
          cached
        }
      }
    })
  }

  return fieldMap
}

function countFileLines (filePath) {
  return new Promise((resolve, reject) => {
    let lineCount = 0
    createReadStream(filePath)
      .on('data', buffer => {
        let idx = -1
        lineCount--
        do {
          idx = buffer.indexOf(10, idx + 1)
          lineCount++
        } while (idx !== -1)
      })
      .on('end', () => {
        resolve(lineCount)
      })
      .on('error', reject)
  })
}

function initializeCache ({ schema, logger }) {
  if (!schema.csv.cache) {
    logger.info('No cache used')
    return null
  }
  const fileName = join(__dirname, './cache', `${schema.csv.cache.name}.json`)
  const fileCache = new FileCache({ fileName, logger })
  fileCache.loadSync()
  return fileCache
}

async function maskCsv ({ input, output, schema, logger, onProgress, onFinish, onError }) {
  const csvOptions = buildCsvOptionsBySchema(schema)
  const cache = await initializeCache({ schema, logger })
  const generator = new DataGenerator(schema)
  const decode = new AutoDetectDecoderStream({ defaultEncoding: 'utf-8' })
  const readCsv = new CsvReadableStream(csvOptions)
  const writer = createWriteStream(output)

  const lineCount = await countFileLines(input)
  let line = 0
  let fieldMap = {}
  return new Promise((resolve, reject) => {
    createReadStream(input)
      .pipe(decode)
      .pipe(readCsv)
      .on('header', rawHeader => {
        const header = rawHeader.map(normalizeString)
        fieldMap = buildFieldMap({ schema, header, logger })
      })
      .on('data', chunk => {
        line++
        onProgress && onProgress(line, lineCount)
        maskLine({
          chunk,
          fieldMap,
          generator,
          line,
          logger,
          schema,
          writer,
          cache
        })
      })
      .on('end', () => {
        onFinish && onFinish(line)
        cache && cache.saveSync()
        writer.close()
        logger.info(`Success - Processed ${line} lines`)
        logger.info(`Masked file written to: ${output}`)
        resolve()
      })
      .on('error', err => {
        onError && onError(line)
        cache && cache.saveSync()
        writer.close()
        logger.error(`Failed processing at line ${line}`)
        reject(err)
      })
  })
}

module.exports = {
  maskCsv
}
