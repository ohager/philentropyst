const { readFileSync } = require('fs')
const { maskCsv } = require('./csvMask')
const yaml = require('yaml')
const { SingleBar, Presets } = require('cli-progress')
const { performance, PerformanceObserver } = require('perf_hooks')

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
  }
}

function stopProgressBar (line) {
  progressBar.update(line)
  progressBar.stop()
}

async function mask ({ input, output, schema, logger, quiet }) {
  logger.info('Start Masking...')

  const perfObserver = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
      logger.info(`Overall duration: ${(entry.duration / 1000).toFixed(3)}s`)
    })
  })
  perfObserver.observe({ entryTypes: ['measure'], buffered: true })

  performance.mark('mask-start')
  const maskSchema = readSchema(schema)
  const onProgress = quiet ? () => {} : updateProgressBar
  const onFinish = (line) => {
    performance.mark('mask-end')
    stopProgressBar(line)
    performance.measure('mask', 'mask-start', 'mask-end')
  }
  if (maskSchema.schema.csv) {
    await maskCsv({
      input,
      output,
      schema: maskSchema.schema,
      logger,
      onProgress,
      onFinish
    })
  } else {
    throw new Error('Could not find supported type: [csv]')
  }
}

module.exports = {
  mask
}
