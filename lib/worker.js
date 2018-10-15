'use strict'

require('./node/index.js')

const npmlog = require('npmlog')

main()
async function main () {
  const opts = require('./config.js')()
  npmlog.heading = 'tink'
  npmlog.level = opts.loglevel || 'warn'
  // TODO - allow injecting options from argv?
  await require('./installer.js')({
    log (level, ...args) { return npmlog[level](...args) }
  })
}
