'use strict'

require('./node/index.js')

const npmlog = require('npmlog')

main()
async function main () {
  npmlog.heading = 'crux'

  const config = await require('./config.js').fromNpm(process.argv)
  npmlog.level = config.loglevel
  await require('./installer.js')(config.concat({
    log (level, ...args) { return npmlog[level](...args) }
  }))
}
