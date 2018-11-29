'use strict'

const figgyPudding = require('figgy-pudding')
const fs = require('graceful-fs')
const path = require('path')

const PrepareOpts = figgyPudding({
  cache: {},
  force: {},
  log: {},
  packages: {}
})

module.exports = prepare
async function prepare (packages, opts) {
  opts = PrepareOpts(opts)
  packages = [...new Set(packages.concat(opts.packages || []))]

  if (opts.force || !await checkPkgLock()) {
    opts.log.verbose('prepare', 'Fetching and installing dependencies.')
    const installer = require('../installer.js')
    try {
      await installer({
        log (level, ...args) {
          return opts.log[level](...args)
        },
        only: packages,
        cache: opts.cache
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
