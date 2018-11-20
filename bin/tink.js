#!/usr/bin/env node

require('../lib/node/index.js')

const CMDS = new Map([
  ['access', require('../lib/commands/access.jsx')],
  ['add', require('../lib/commands/add.js')],
  ['build', require('../lib/commands/build.js')],
  ['deprecate', require('../lib/commands/deprecate.js')],
  ['org', require('../lib/commands/org.jsx')],
  ['ping', require('../lib/commands/ping.js')],
  ['prepare', require('../lib/commands/prepare.js')],
  ['profile', require('../lib/commands/profile.jsx')],
  ['rm', require('../lib/commands/rm.js')],
  ['shell', require('../lib/commands/shell.js')],
  ['team', require('../lib/commands/team.js')],
  ['view', require('../lib/commands/view.js')],
  ['whoami', require('../lib/commands/whoami.js')]
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
