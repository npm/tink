'use strict'

const figgyPudding = require('figgy-pudding')
const fs = require('graceful-fs')
const path = require('path')

const PrepareOpts = figgyPudding({
  cache: {},
  force: {},
  log: {},
  packages: {},
  production: {}
})

module.exports = prepare
async function prepare (argv, opts) {
  opts = PrepareOpts(opts)
  const packages = [...new Set(argv.packages || [])]

  process.tink = {
    cache: path.resolve(opts.cache),
    config: opts
  }
  if (opts.production) {
    process.tink.config = figgyPudding({
      production: { default: true }
    })()
  }

  if (opts.force || !await checkPkgLock()) {
    if (opts.production && !opts.force) {
      throw new Error('Tried to run in production mode, but the package.json and package lock are out of sync. Run `prepare` without `--production` and try again.')
    }
    opts.log.verbose('prepare', 'Fetching and installing dependencies.')
    const installer = require('../installer.js')
    try {
      await installer({
        log (level, ...args) {
          return opts.log[level](...args)
        },
        only: packages
      })
    } catch (e) {
      opts.log.error('prepare', e)
    }
  }

  function checkPkgLock () {
    opts.log.verbose('prepare', 'checking package-lock is up to date.')
    try {
      const base = process.cwd()
      const lock = JSON.parse(stripBOM(fs.readFileSync(path.join(base, 'package-lock.json'), 'utf8')))
      const map = JSON.parse(stripBOM(fs.readFileSync(path.join(base, 'node_modules', '.pkglock-hash'), 'utf8')))
      require('ssri').checkData(
        JSON.stringify(lock), map.lockfile_integrity, { error: true }
      )
      return map
    } catch (err) {
      return false
    }
  }

  function stripBOM (str) {
    return str.replace(/^\uFEFF/, '')
  }
}
