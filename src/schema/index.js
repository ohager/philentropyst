const { copyFileSync } = require('fs')
const { join } = require('path')

const SchemaTemplatePath = join(__dirname, './template.schema.yml')

async function schema ({ logger, outfile }) {
  const outfilePath = join(process.cwd(), outfile)
        logger.info('Creating default schema...')
  copyFileSync(SchemaTemplatePath, outfilePath)
  logger.info(`Written to: ${outfilePath}`)
  return Promise.resolve()
}

module.exports = {
  schema
}
