'use strict'

module.exports = mkCmdHandler
function mkCmdHandler (cmd) {
  const npmConfig = require('../config.js')
  return async function (argv) {
    return require(cmd)(argv._.slice(1), npmConfig(argv))
  }
}
