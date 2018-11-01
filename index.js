#!/usr/bin/env node

require('./lib/node/index.js')

if (require.main === module) {
  main()
}
module.exports = main
function main () {
  return require('yargs')
    .commandDir('./lib/commands/yargs-modules')
    .demandCommand()
    .help()
    .argv
}
