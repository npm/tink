#!/usr/bin/env node

require('../lib/node/index.js')

const MainOpts = require('figgy-pudding')(require('../lib/common-opts.js'))
const CMDS = new Map([
  ['sh', require('../lib/commands/shell.js')],
  ['shell', require('../lib/commands/shell.js')],
  ['prep', require('../lib/commands/prepare.js')],
  ['prepare', require('../lib/commands/prepare.js')],
  ['ping', require('../lib/commands/ping.js')]
])

if (require.main === module) {
  main(process.argv)
}

module.exports = main
function main (argv) {
  const log = require('npmlog')
  const npmConfig = require('../lib/config.js')
  log.heading = 'tink'
  if (needsYargs(argv)) {
    console.error('using yargs...', argv)
    let config = require('yargs')
      .demandCommand(1, 'Subcommand is required')
      .recommendCommands()
      .help()
      .alias('help', 'h')
      .alias('version', 'v')
      .completion()
    for (const mod of CMDS.values()) {
      config = config.command(mod)
    }
    const yargv = npmConfig(config.argv).concat({ log })
    log.level = yargv.loglevel || 'notice'
  } else {
    // This is an optimization because Yargs can be expensive to load.
    const opts = npmConfig({ log, _: argv.slice(2) })
    log.level = opts.loglevel
    return noYargsShortcut(argv[2], opts)
  }
}

function needsYargs (argv) {
  return argv.length > 3 && (
    argv[3] !== '--' && argv[3].match(/^--?[a-z0-9]+/i)
  )
}

function noYargsShortcut (cmd, opts) {
  return CMDS.get(cmd).handler(opts)
}
