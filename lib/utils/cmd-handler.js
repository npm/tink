'use strict'

module.exports = mkCmdHandler
function mkCmdHandler (cb) {
  const npmConfig = require('../config.js')
  return async function (argv) {
    return cb(argv, npmConfig(argv))
  }
}
