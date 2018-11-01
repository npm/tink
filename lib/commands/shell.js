'use strict'

const cp = require('child_process')
const fs = require('graceful-fs')
const npmlog = require('npmlog')
const path = require('path')

module.exports = main
function main (argv) {
  npmlog.heading = 'tink'
  let pkgMap = checkPkgMap()
  if (!pkgMap) {
    cp.spawnSync(process.argv[0], [
      require.resolve('../worker.js'), ...process.argv.slice(2)
    ], {
      stdio: 'inherit'
    })
  }
  if ((argv.nodeArg && argv.nodeArg.length) || !argv.script) {
    cp.spawnSync(
      process.argv[0],
      ['-r', require.resolve('../node'), ...(argv.nodeArg || []), ...(argv.script ? [argv.script, ...(argv.arguments || [])] : [])],
      {stdio: 'inherit'}
    )
  } else {
    const Module = require('module')
    require('clear-module').all()
    process.argv = [
      process.argv[0],
      path.resolve(argv.script),
      ...(argv.arguments || [])
    ]
    Module.runMain() // ✨MAGIC✨. Sorry-not-sorry
  }
}

function checkPkgMap () {
  try {
    const base = process.cwd()
    const lock = JSON.parse(stripBOM(fs.readFileSync(path.join(base, 'package-lock.json'), 'utf8')))
    const map = JSON.parse(stripBOM(fs.readFileSync(path.join(base, '.package-map.json'), 'utf8')))
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
