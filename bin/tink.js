#!/usr/bin/env node

const reqmain = require.main
require('../lib/node/index.js').overrideNode()
require = require('esm')(module, { //eslint-disable-line
  force: true,
  cjs: {
    interop: true,
    namedExports: true,
    extensions: true,
    vars: true
  }
})

const CMDS = new Set([
  'access',
  'add',
  'build',
  'deprecate',
  'org',
  'ping',
  'prepare',
  'profile',
  'rm',
  'shell',
  'team',
  'view',
  'whoami'
])

const ALIASES = new Map([
  ['prep', 'prepare'],
  ['sh', 'shell']
])

if (reqmain === module) {
  main(process.argv)
}

module.exports = main
function main (argv) {
  const log = require('npmlog')
  log.heading = 'tink'
  return runCommandWithYargs(argv, log)
}

function runCommandWithYargs (argv, log) {
  let config = require('yargs')
    .demandCommand(1, 'Subcommand is required')
    .recommendCommands()
    .help()
    .alias('help', 'h')
    .alias('version', 'v')
    .completion()
  if (ALIASES.has(argv[2])) {
    config = config.command(require(`../lib/yargs-modules/${ALIASES.get(argv[2])}.js`))
  } else if (CMDS.has(argv[2])) {
    config = config.command(require(`../lib/yargs-modules/${argv[2]}.js`))
  } else {
    for (const mod of CMDS.values()) {
      config = config.command(require(`../lib/yargs-modules/${mod}.js`))
    }
  }
  config = config.argv
}
