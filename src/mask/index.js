const { readFileSync } = require('fs')
const { maskCsv } = require('./csvMask')
const yaml = require('yaml')
const { SingleBar, Presets } = require('cli-progress')

const progressBar = new SingleBar({}, Presets.rect)
let progressStarted = false

function readSchema (schemaPath) {
  const schema = readFileSync(schemaPath, 'utf-8')
  return yaml.parse(schema)
}

function updateProgressBar (progress, total) {
  if (!progressStarted) {
    progressBar.start(total, progress)
    progressStarted = true
  } else {
    progressBar.update(progress)
    total - progress <= 0 && progressBar.stop()
  }
}

async function mask ({ input, output, schema, logger, quiet }) {
  logger.info('Starting Masking...')
  const maskSchema = readSchema(schema)
  const onProgress = quiet ? () => {} : updateProgressBar
  if (maskSchema.schema.csv) {
    await maskCsv({ input, output, schema: maskSchema.schema, logger, onProgress })
  } else {
    throw new Error('Could not find supported type: [csv]')
  }
}

module.exports = {
  mask
}
