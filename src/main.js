const { program } = require('commander')
const { schema } = require('./schema')
const { mask } = require('./mask')
const { version } = require('../package.json')

program.version(version)

program
  .command('mask', { isDefault: true })
  .requiredOption('-i, --input <path>', 'Input File')
  .requiredOption('-o, --output <path>', 'Output File')
  .requiredOption('-s, --schema <path>', 'The Masking Schema')
  .option('-v, --verbose', 'Verbose output')
  .action(mask)

program.command('schema')
  .requiredOption('-n, --name <path>', 'Schema file name')
  .action(schema)

program.parse(process.argv)
