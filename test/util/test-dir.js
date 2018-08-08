'use strict'

const mkdirp = require('mkdirp')
const path = require('path')
const rimraf = require('rimraf')
const tap = require('tap')

const cacheDir = path.resolve(__dirname, '../cache')

module.exports = {
  path: testDir(),
  reset
}

function testDir (filename) {
  filename = filename || (module.parent && module.parent.filename)
  if (!filename) { throw new Error('needed a filename') }
  const base = path.basename(filename, '.js')
  const dir = path.join(cacheDir, base)
  tap.beforeEach(cb => {
    reset(dir)
    cb()
  })
  if (!process.env.KEEPCACHE) {
    tap.tearDown(() => {
      process.chdir(__dirname)
      // This is ok cause this is the last
      // thing to run in the process
      try {
        rimraf.sync(dir)
      } catch (err) {}
    })
  }
  return dir
}

function reset (testDir) {
  process.chdir(__dirname)
  rimraf.sync(testDir)
  mkdirp.sync(testDir)
  process.chdir(testDir)
}
