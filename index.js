#!/usr/bin/env node

require('./lib/node/index.js')

const cp = require('child_process')
const fs = require('fs')
const npmlog = require('npmlog')
const path = require('path')
const yargs = require('yargs')

if (require.main === module) {
  main()
}
module.exports = main
function main () {
  npmlog.heading = 'tink'
  let pkgMap = checkPkgMap()
  if (!pkgMap) {
    cp.spawnSync(process.argv[0], [
      require.resolve('./lib/worker.js'), ...process.argv.slice(2)
    ], {
      stdio: 'inherit'
    })
  }
  const nodeArgs = [...([].concat(yargs.argv.nodeArg || [])), ...yargs.argv._]
  cp.spawnSync(
    process.argv[0],
    ['-r', require.resolve('./lib/node'), ...nodeArgs],
    {stdio: 'inherit'}
  )
}

function checkPkgMap () {
  try {
    const base = process.cwd()
    const lock = JSON.parse(stripBOM(fs.readFileSync(path.join(base, 'package-lock.json'), 'utf8')))
    const map = JSON.parse(stripBOM(fs.readFileSync(path.join(base, 'node_modules', '.package-map.json'), 'utf8')))
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
