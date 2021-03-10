const { onShutdown } = require('node-graceful-shutdown')
const { sleep } = require('../shared/sleep')

async function schema ({ logger }) {
  logger.info('schema')
  await sleep(2000)
  return Promise.resolve()
}

onShutdown('schema', async () => {
  console.log('closing...')
  await sleep(2000)
})

module.exports = {
  schema
}
