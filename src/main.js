const { LoggerFactory } = require('./shared/logger')
const { program } = require('commander')
const { schema } = require('./schema')
const { mask } = require('./mask')
const { version } = require('../package.json')

function getLogger (opts) {
  let logLevel = 'info'
  if (opts.quiet) {
    logLevel = 'silent'
  } else if (opts.verbose) {
    logLevel = 'trace'
  }
  return LoggerFactory.create({
    logfilePath: opts.logfile,
    logLevel
  })
}

program.version(version)

program.command('mask', { isDefault: true })
  .requiredOption('-i, --input <path>', 'Input File')
  .requiredOption('-o, --output <path>', 'Output File')
  .requiredOption('-s, --schema <path>', 'The Masking Schema')
  .option('-l, --logfile <path>', 'The logfile name')
  .option('-v, --verbose', 'Verbose output')
  .option('-q, --quiet', 'No output at all')
  .action(async (opts) => {
    const { schema, output, input } = opts
    await mask({
      schema,
      input,
      output,
      logger: getLogger(opts)
    })
  })

program.command('schema')
  .option('-o, --outfile <path>', 'Outfile Schema file name', 'schema.yml')
  .option('-l, --logfile <path>', 'The logfile name')
  .option('-v, --verbose', 'Verbose output')
  .option('-q, --quiet', 'No output at all')
  .action(async (opts) => {
    await schema({
      logger: getLogger(opts)
    })
  })

program.parse(process.argv)
