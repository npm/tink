'use strict'

const Prepare = module.exports = {
  command: 'prepare [packages...]',
  aliases: ['prep'],
  describe: 'pre-fetch dependencies, or only the listed ones',
  builder (y) {
    return y.help().alias('help', 'h').options(Prepare.options)
  },
  options: Object.assign(require('../common-opts.js'), {
    force: {
      alias: 'f',
      describe: 'Unconditionally prepare dependencies.',
      type: 'boolean'
    },
    packages: { hidden: true }
  }),
  handler: async (...args) => prepare(...args)
}

async function prepare (argv, packages) {
  const npmConfig = require('../config.js')
  const figgyPudding = require('figgy-pudding')
  const fs = require('graceful-fs')
  const path = require('path')

  const opts = figgyPudding(Prepare.options)(npmConfig(argv))

  if (argv.force || !await checkPkgLock()) {
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
      opts.log.error('installer', e)
    }
  }

  function checkPkgLock () {
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
