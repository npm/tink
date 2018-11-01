'use strict'

const cacache = require('cacache')
const path = require('path')
const rimraf = require('rimraf')
const Tacks = require('tacks')
const { test } = require('tap')
const testDir = require('./util/test-dir.js')

const { File, Dir } = Tacks

const pkgmap = require('../lib/pkgmap.js')

test('UNIT readPkgMap', t => {
  process.tink = {
    cache: './here'
  }
  const pkgMap = {
    path_prefix: '/node_modules',
    packages: {
      'eggplant': {
        files: {
          'hello.js': 'sha1-deadbeef'
        }
      }
    },
    scopes: {
      'eggplant': {
        path_prefix: '/node_modules',
        packages: {
          'aubergine': {
            files: {
              'bonjour.js': 'sha1-badc0ffee'
            }
          },
          '@myscope/scoped': {
            files: {
              'ohmy.js': 'sha1-abcdef',
              'lib': {
                'hithere.js': 'sha1-badbebe'
              }
            }
          }
        }
      }
    }
  }
  const fixture = new Tacks(Dir({
    '.package-map.json': File(pkgMap)
  }))
  fixture.create(testDir.path)
  t.deepEqual(pkgmap.readPkgMap('node_modules/eggplant'), {
    pkgMap,
    subPath: '/node_modules/eggplant'
  })
  t.done()
})

test('resolve: finds an existing path into a .package-map.json', async t => {
  process.tink = {
    cache: './here'
  }
  const fixture = new Tacks(Dir({
    '.package-map.json': File({
      path_prefix: '/node_modules',
      packages: {
        'eggplant': {
          files: {
            'hello.js': 'sha1-deadbeef'
          }
        }
      },
      scopes: {
        'eggplant': {
          path_prefix: '/node_modules',
          packages: {
            'aubergine': {
              files: {
                'bonjour.js': 'sha1-badc0ffee'
              }
            },
            '@myscope/scoped': {
              files: {
                'ohmy.js': 'sha1-abcdef',
                'lib': {
                  'hithere.js': 'sha1-badbebe'
                }
              }
            }
          }
        }
      }
    })
  }))
  fixture.create(testDir.path)
  const prefix = path.join(testDir.path, 'node_modules', 'eggplant')
  t.similar(pkgmap.resolve(prefix, 'hello.js'), {
    cache: './here',
    hash: 'sha1-deadbeef',
    pkg: {
      files: {
        'hello.js': 'sha1-deadbeef'
      }
    }
  }, 'found file spec inside a package-map')
  t.equal(pkgmap.resolve(prefix, 'goodbye.js'), false, 'null on missing file')
  const nested = path.join(prefix, 'node_modules', 'aubergine')
  t.similar(pkgmap.resolve(nested, 'bonjour.js'), {
    cache: './here',
    hash: 'sha1-badc0ffee',
    pkg: {
      files: {
        'bonjour.js': 'sha1-badc0ffee'
      }
    }
  }, 'found nested file spec inside a package-map')
  const scoped = path.join(prefix, 'node_modules', '@myscope/scoped')
  t.similar(pkgmap.resolve(scoped, 'ohmy.js'), {
    cache: './here',
    hash: 'sha1-abcdef'
  }, 'found nested scoped spec inside a package-map')
  t.similar(pkgmap.resolve(scoped, 'lib/hithere.js'), {
    cache: './here',
    hash: 'sha1-badbebe',
    resolvedPath: path.resolve(scoped, 'lib', 'hithere.js')
  }, 'found nested scoped spec in a directory in a package')
  rimraf.sync(path.join(testDir.path))
  t.similar(pkgmap.resolve(prefix, 'hello.js'), {
    cache: './here',
    hash: 'sha1-deadbeef',
    pkg: {
      files: {
        'hello.js': 'sha1-deadbeef'
      }
    }
  }, 'found file even though pkgmap deleted')
  pkgmap._clearCache()
  t.equal(pkgmap.resolve(prefix, 'hello.js'), null, 'cache gone')
  pkgmap._clearCache()
})

test('read: reads a file defined in a package map', async t => {
  const cacheDir = path.join(testDir.path, '_cacache')
  const hash = await cacache.put(cacheDir, 'eggplant:hello', 'hello world')
  process.tink = {
    cache: cacheDir
  }
  const fixture = new Tacks(Dir({
    '.package-map.json': File({
      path_prefix: '/node_modules',
      packages: {
        'eggplant': {
          files: {
            'hello.js': hash
          }
        }
      }
    })
  }))
  fixture.create(testDir.path)
  const p = pkgmap.resolve(
    testDir.path, 'node_modules', 'eggplant', 'hello.js'
  )
  t.equal(
    (await pkgmap.read(p)).toString('utf8'),
    'hello world',
    'got data from cache'
  )
  t.equal(
    pkgmap.readSync(p).toString('utf8'),
    'hello world',
    'got data from cache (sync)'
  )
  pkgmap._clearCache()
})

test('read: automatically installs if a file is missing from cache')

test('stat: get filesystem stats for a file', async t => {
  const cacheDir = path.join(testDir.path, '_cacache')
  const hash = await cacache.put(cacheDir, 'eggplant:hello', 'hello world')
  process.tink = {
    cache: cacheDir
  }
  const fixture = new Tacks(Dir({
    '.package-map.json': File({
      path_prefix: '/node_modules',
      packages: {
        'eggplant': {
          files: {
            'hello.js': hash
          }
        }
      }
    })
  }))
  fixture.create(testDir.path)
  const p = pkgmap.resolve(
    testDir.path, 'node_modules', 'eggplant', 'hello.js'
  )
  const stat = await pkgmap.stat(p)
  t.ok(stat, 'got stat from cache file')
  t.ok(stat.isFile(), 'stat is a file')
  t.ok(!stat.isDirectory(), 'stat is not a directory')
  t.ok(pkgmap.statSync(p), 'got stat from cache (sync)')
  t.equal(
    await pkgmap.stat({ cache: cacheDir, hash: 'sha1-deadbeef', resolvedPath: '/foo/bar' }),
    false,
    'returns false if stat fails'
  )
  t.equal(
    pkgmap.statSync({ cache: cacheDir, hash: 'sha1-deadbeef', resolvedPath: '/foo/bar' }),
    false,
    'returns false if stat fails'
  )
  pkgmap._clearCache()
})
