'use strict'

let config
let ensurePkg
let prepare

if (require.main === module && process.argv[2] === 'ensure-pkg') {
  main(...process.argv.slice(3))
}

module.exports = main
async function main (cache, integrity, pkg) {
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
  try {
    if (!prepare) { prepare = require('./commands/prepare.js') }
    const { pkgCount } = await prepare.handler(opts, [pkg.name])
    if (!pkgCount) { throw new Error('no packages installed') }
  } catch (err) {
    if (!ensurePkg) { ensurePkg = require('./ensure-package.js') }
    await ensurePkg(cache, pkg.name, pkg, opts)
  }
}
