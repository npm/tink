'use strict'

const fs = require('fs')
const path = require('path')
const { test } = require('tap')
const { overrideNode } = require('../../lib/node/fs')

overrideNode()

test('lstatSync', t => {
  process.tink = {
    _isSelf_: true,
    cache: path.join(__dirname, '../.cache'),
    config: {
      concat: () => null
    }
  }

  try {
    const stat = fs.lstatSync(path.join(__dirname, '../fixtures/p1/node_modules/require-from-path/package.json'))
    t.equal(stat.integrity, 'sha256-zH8eaxFgnwlLNL9Ze8zmBqDB0WbqdOBrSs8r2PO5Jxo=', `fs-pkglock.lstatSync integrity should match`)
    t.end()
  } catch (err) {
    t.fail(`fs-pkglock.lstatSync caught ${err}`)
  }
})
