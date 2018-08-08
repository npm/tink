#!/usr/bin/env node

require('./lib/node/index.js')

const fs = require('fs')
const npmlog = require('npmlog')
const path = require('path')
const util = require('util')

const readFileAsync = util.promisify(fs.readFile)

if (require.main === module) {
  main()
}
module.exports = main
async function main () {
  const startTime = Date.now()
  npmlog.heading = 'frog'
  let pkgMap = await checkPkgMap()
  if (!pkgMap) {
    const config = await require('./lib/config.js').fromNpm(process.argv)
    npmlog.level = config.loglevel
    pkgMap = (await require('./lib/installer.js')(config.concat({
      log (level, ...args) { return npmlog[level](...args) }
    }))).pkgMap
  }
  npmlog.info('package-map', 'package map loaded in', `${(Date.now() - startTime) / 1000}s`)
  npmlog.notice('exec', 'executing `main` using frogged dependencies (TODO)')
  npmlog.notice('exec', 'dep lockfile integrity:', pkgMap.lockfile_integrity)
}

async function checkPkgMap () {
  try {
    const base = process.cwd()
    const lock = JSON.parse(stripBOM(await readFileAsync(path.join(base, 'package-lock.json'), 'utf8')))
    const map = JSON.parse(stripBOM(await readFileAsync(path.join(base, 'node_modules', '.package-map.json'), 'utf8')))
    require('ssri').checkData(
      JSON.stringify(lock), map.lockfile_integrity, {error: true}
    )
    return map
  } catch (err) {
    return false
  }
}

function stripBOM (str) {
  return str.replace(/^\uFEFF/, '')
}
