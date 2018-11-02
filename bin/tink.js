#!/usr/bin/env node

require('../lib/node/index.js')

if (require.main === module) {
  main()
}
module.exports = main
function main () {
  require('npmlog').heading = 'tink'
  return require('yargs')
    .commandDir('../lib/yargs-modules')
    .demandCommand(1, 'Subcommand is required')
    .strict()
    .help()
    .alias('help', 'h')
    .alias('version', 'v')
    .argv
}
