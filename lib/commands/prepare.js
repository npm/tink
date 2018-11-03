'use strict'

const Prepare = module.exports = {
  command: 'prepare',
  aliases: ['prep'],
  describe: 'pre-fetch all dependencies',
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
  let pkgMap = await checkPkgMap()
  if (!pkgMap || argv.force) {
    const installer = require('../installer.js')
    try {
      await installer({
        log (level, ...args) {
          return log[level](...args)
        }
      })
    } catch (e) {
      log.error('installer', e)
    }
  }
  return pkgMap

  function checkPkgMap () {
    try {
      const base = process.cwd()
      const lock = JSON.parse(stripBOM(fs.readFileSync(path.join(base, 'package-lock.json'), 'utf8')))
      const map = JSON.parse(stripBOM(fs.readFileSync(path.join(base, '.package-map.json'), 'utf8')))
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
