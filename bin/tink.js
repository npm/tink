#!/usr/bin/env node

require('../lib/node/index.js')

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
  log.heading = 'tink'
  const npmConfig = require('../lib/config.js')
  if (needsYargs(argv)) {
    return runCommandWithYargs(argv, log, npmConfig)
  } else {
    return noYargsShortcut(argv, log, npmConfig)
  }
}

function needsYargs (argv) {
  return argv.length > 3 && (
    argv[3] !== '--' && argv[3].match(/^--?[a-z0-9]+/i)
  )
}

function runCommandWithYargs (argv, log, npmConfig) {
  // This code path costs ~200ms on startup.
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
}

function noYargsShortcut (argv, log, npmConfig) {
  // This is an optimization because Yargs can be expensive to load.
  const opts = npmConfig({ log, _: argv.slice(2) })
  log.level = opts.loglevel
  const cmd = CMDS.get(argv[2])
  if (!cmd) {
    return runCommandWithYargs(argv, log, npmConfig)
  } else {
    return cmd.handler(opts)
  }
}
