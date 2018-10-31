#!/usr/bin/env node

require('./lib/node/index.js')

const cp = require('child_process')
const fs = require('fs')
const npmlog = require('npmlog')
const path = require('path')

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
