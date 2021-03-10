const { sleep } = require('../shared/sleep')
const { onShutdown } = require('node-graceful-shutdown')

function mask ({ input, output, schema, logger }) {
  logger.info('Mask running now...')
  return Promise.resolve()
}

onShutdown('mask', async () => {
  await sleep(2000)
})

module.exports = {
  mask
}
