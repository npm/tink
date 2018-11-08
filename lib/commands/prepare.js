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
    }
  }),
  handler: async argv => prepare(argv)
}

async function prepare (argv) {
  const figgyPudding = require('figgy-pudding')
  const fs = require('graceful-fs')
  const log = require('npmlog')
  const path = require('path')

  const opts = figgyPudding(Prepare.options)(argv)

  log.level = opts.loglevel
  if (argv.force || !await checkPkgLock()) {
    const installer = require('../installer.js')
    try {
      await installer({
        log (level, ...args) {
          return log[level](...args)
        },
        only: argv.packages
      })
    } catch (e) {
      log.error('installer', e)
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
