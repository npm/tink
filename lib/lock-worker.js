'use strict'
let config
if (require.main === module && process.argv[2] === 'ensure-pkg') {
  process.nextTick(async function () {
    let [cache, integrity, pkg] = process.argv.slice(3)
    pkg = JSON.parse(pkg)
    if (!config) { config = require('./config.js') }
    const opts = config().concat({
      cache,
      integrity,
      log: require('npmlog'),
      // loglevel: 'silly',
      'restore-missing': true,
      force: true
    }, {
      other () { return true }
    })
    opts.log.heading = 'tink'
    opts.log.level = opts.loglevel
    opts.log.notice('fs', 'unpacking', `${pkg.name}@${pkg.version}`)
    await require('./commands/prepare.js').handler(opts, [pkg.name])
  })
}
