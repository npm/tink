#!/usr/bin/env node

require('../lib/node/index.js')

const CMDS = new Map([
  ['sh', require('../lib/commands/shell.js')],
  ['shell', require('../lib/commands/shell.js')],
  ['prep', require('../lib/commands/prepare.js')],
  ['prepare', require('../lib/commands/prepare.js')],
  ['ping', require('../lib/commands/ping.js')],
  ['team', require('../lib/commands/team.js')]
])

if (require.main === module) {
  main(process.argv)
}

module.exports = main
function main (argv) {
  const log = require('npmlog')
  log.heading = 'tink'
  const npmConfig = require('../lib/config.js')
  return runCommandWithYargs(argv, log, npmConfig)
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
  require('../lib/node/index.js')
  const yargv = npmConfig(config.argv).concat({ log })
  log.level = yargv.loglevel || 'notice'
}
