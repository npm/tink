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
    .demandCommand()
    .help()
    .argv
}
