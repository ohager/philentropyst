const { copyFileSync } = require('fs')
const { join } = require('path')

const SchemaTemplatePath = join(__dirname, './template.schema.yml')

async function schema ({ logger, outfile }) {
  const outfilePath = join(process.cwd(), './schema.yml')
  logger.info('Writing default schema...')
  copyFileSync(SchemaTemplatePath,outfilePath)
  logger.info(`Written to: ${outfilePath}`)
  return Promise.resolve()
}

module.exports = {
  schema
}
