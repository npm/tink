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
  opts.log.notice('fs', 'unpacking', `${pkg.name}@${pkg.version}`)
  try {
    if (!prepare) { prepare = require('./commands/prepare.js') }
    opts.log.level = 'silent'
    const res = await prepare.handler(opts.concat({
      loglevel: 'silent'
    }), [pkg.name])
    if (res && !res.pkgCount) { throw new Error('no packages installed') }
  } catch (err) {
    throw err
    if (!ensurePkg) { ensurePkg = require('./ensure-package.js') }
    opts.log.level = opts.loglevel
    await ensurePkg(cache, pkg.name, pkg, opts)
  }
}
