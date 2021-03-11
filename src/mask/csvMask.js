const { EOL } = require('os')
const { createReadStream, createWriteStream } = require('fs')
const CsvReadableStream = require('csv-reader')
const AutoDetectDecoderStream = require('autodetect-decoder-stream')
const { generateData } = require('./generateData')

function buildCsvOptionsBySchema (schema) {
  const s = schema.csv
  return {
    delimiter: s.delimiter,
    multiline: s.multiline,
    allowQuotes: s.allowQuotes
  }
}

function normalizeString (str) {
  return str.trim().toLowerCase().replace(/"/ig, '')
}

const wrapInQuotes = str => `"${str}"`

function maskLine ({ schema, logger, writer, line, fieldMap, chunk }) {
  const csv = schema.csv
  const masks = schema.masks
  const isHeader = schema.csv.hasHeader && line === 1

  masks.forEach(({ field }) => {
    const ref = normalizeString(field.ref)
    const fieldIndex = csv.hasHeader ? fieldMap[ref] : parseInt(ref, 10)
    if (!isHeader && !Number.isNaN(fieldIndex) && fieldIndex < chunk.length) {
      chunk[fieldIndex] = generateData(field)
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
  if (schema.csv.hasHeader) {
    masksRefs.forEach(ref => {
      if (!header.includes(ref)) {
        logger.warn(`Header does not contain field '${ref}'`)
      }
    })
    header.forEach((column, i) => {
      fieldMap[normalizeString(column)] = i
    })
  } else {
    masksRefs.forEach(ref => {
      const index = parseInt(ref, 10)
      if (Number.isNaN(index) || index < 0 || index >= header.length) {
        logger.warn(`Invalid numeric ref '${ref}' (must be between 0 and ${header.length - 1})`)
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

async function maskCsv ({ input, output, schema, logger, onProgress = () => {} }) {
  const csvOptions = buildCsvOptionsBySchema(schema)
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
        onProgress(line, lineCount)
        maskLine({ schema, logger, writer, line, fieldMap, chunk })
      })
      .on('end', () => {
        logger.info(`Success - Processed ${line} lines`)
        writer.close()
        resolve()
      })
      .on('error', err => {
        logger.error(`Failed processing at line ${line}`)
        writer.close()
        reject(err)
      })
  })
}

module.exports = {
  maskCsv
}
