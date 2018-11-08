#!/usr/bin/env node

require('../lib/node/index.js')

const yargs = require('yargs')
const log = require('npmlog')

const npmConfig = require('../lib/config.js')

const CMDS = new Map([
  ['shell', require('../lib/commands/shell.js')],
  ['org', require('../lib/commands/org.jsx')],
  ['prepare', require('../lib/commands/prepare.js')],
  ['ping', require('../lib/commands/ping.js')]
])

if (require.main === module) {
  main(process.argv)
}

module.exports = main
function main (argv) {
  log.heading = 'tink'
  return runCommandWithYargs(argv, log, npmConfig)
}

function runCommandWithYargs (argv, log, npmConfig) {
  let config = yargs
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
