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
  if (argv.nodeArg && argv.nodeArg.length) {
    cp.spawnSync(
      process.argv[0],
      ['-r', require.resolve('../node'), ...(argv.nodeArg || []), ...(argv.script ? [argv.script, ...(argv.arguments || [])] : [])],
      { stdio: 'inherit' }
    )
  } else if (argv._.length) {
    const Module = require('module')
    require('clear-module').all()
    process.argv = [
      process.argv[0],
      ...argv._.slice(1)
    ]
    Module.runMain()
  } else {
    const { createRepl } = require('../node/repl.js')
    createRepl(process.env, {}, (err, repl) => {
      if (err) {
        throw err
      }
      repl.on('exit', function () {
        if (repl._flushing) {
          repl.pause()
          return repl.once('flushHistory', function () {
            process.exit()
          })
        }
        process.exit()
      })
    })
  }
}

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
