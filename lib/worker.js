'use strict'

const npmlog = require('npmlog')

main()
async function main () {
  npmlog.heading = 'frog'

  const config = await require('../lib/config.js').fromNpm(process.argv)
  npmlog.level = config.loglevel
  const pkgMap = await require('../index.js')(config.concat({
    log (level, ...args) { return npmlog[level](...args) }
  }))
  console.log(JSON.stringify({
    pkgMap,
    cache: config.cache
  }))
}
