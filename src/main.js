const { program } = require('commander')
const path = require('path')
const { LoggerFactory } = require('./logger')
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
  .requiredOption('-s, --schema <path>', 'The Masking Schema')
  .option('-o, --output <path>', 'Output File', '<inputfile>.masked.<inputfile.suffix>')
  .option('-l, --logfile <path>', 'The logfile name')
  .option('-v, --verbose', 'Verbose output')
  .option('-q, --quiet', 'No output at all')
  .action(async (opts) => {
    if (opts.output.startsWith('<inputfile>')) {
      const extname = path.extname(opts.input)
      opts.output = extname ? opts.input.replace(extname, `.masked${extname}`) : opts.input + '.masked'
    }
    await mask({
      ...opts,
      logger: getLogger(opts)
    })
  })

program.command('schema')
  .requiredOption('-o, --outfile <path>', 'Outfile Schema file name', 'schema.yml')
  .option('-l, --logfile <path>', 'The logfile name')
  .option('-v, --verbose', 'Verbose output')
  .option('-q, --quiet', 'No output at all')
  .action(async (opts) => {
    await schema({
      ...opts,
      logger: getLogger(opts)
    })
  })

program.parse(process.argv)
