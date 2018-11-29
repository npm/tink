'use strict'

const figgyPudding = require('figgy-pudding')
const { log } = require('libnpm')
const { test } = require('tap')
const tnock = require('./util/tnock.js')

const cache = {
  '_id': 'cond',
  '_rev': '19-d458a706de1740662cd7728d7d7ddf07',
  'name': 'cond',
  'time': {
    'modified': '2015-02-13T07:33:58.120Z',
    'created': '2014-03-16T20:52:52.236Z',
    '0.0.0': '2014-03-16T20:52:52.236Z',
    '0.0.1': '2014-03-16T21:12:33.393Z',
    '0.0.2': '2014-03-16T21:15:25.430Z'
  },
  'versions': {
    '0.0.0': {},
    '0.0.1': {},
    '0.0.2': {}
  },
  'dist-tags': {
    'latest': '0.0.2'
  },
  'description': 'Restartable error handling system',
  'license': 'CC0'
}

log.level = process.env.LOGLEVEL || 'silent'
const OPTS = figgyPudding({
  registry: {},
  log: {},
  loglevel: {}
}, { other () { return true } })({
  registry: 'https://mock.reg',
  log,
  loglevel: log.level
})

const deprecate = require('../lib/commands/deprecate.js')

test('tink deprecate an unscoped package', async t => {
  const deprecated = JSON.parse(JSON.stringify(cache))
  deprecated.versions = {
    '0.0.0': {},
    '0.0.1': { deprecated: 'make it dead' },
    '0.0.2': {}
  }

  // Clone OPTS and modify it for this test
  const opts = OPTS.concat({
    'pkg@version': `${deprecated.name}@0.0.1`,
    message: deprecated.versions['0.0.1'].deprecated
  })

  // Setup mock registry server
  tnock(t, opts.registry).get('/cond?write=true').reply(200, cache)
  tnock(t, opts.registry).put('/cond', deprecated).reply(201, { deprecated: true })

  // Run the function
  const res = await deprecate([], opts)

  // Verify the result
  t.equal(res.status, 201)
})

test('tink deprecate a scoped package', async t => {
  // Clone cache and modify it for this test
  const cacheCopy = JSON.parse(JSON.stringify(cache))
  cacheCopy.name = '@scope/cond'
  cacheCopy._id = '@scope/cond'
  const deprecated = JSON.parse(JSON.stringify(cacheCopy))
  deprecated.versions = {
    '0.0.0': {},
    '0.0.1': { deprecated: 'make it dead' },
    '0.0.2': {}
  }

  // Clone OPTS and modify it for this test
  const opts = OPTS.concat({
    'pkg@version': `${deprecated.name}@0.0.1`,
    message: deprecated.versions['0.0.1'].deprecated
  })

  // Setup mock registry server
  tnock(t, opts.registry).get('/@scope%2fcond?write=true').reply(200, cacheCopy)
  tnock(t, opts.registry).put('/@scope%2fcond', deprecated).reply(201, { deprecated: true })

  // Run the function
  const res = await deprecate([], opts)

  // Verify the result
  t.equal(res.status, 201)
})

test('tink deprecate semver range', async t => {
  // Clone cache and modify it for this test
  const deprecated = JSON.parse(JSON.stringify(cache))
  deprecated.versions = {
    '0.0.0': { deprecated: 'make it dead' },
    '0.0.1': { deprecated: 'make it dead' },
    '0.0.2': {}
  }

  // Clone OPTS and modify it for this test
  const opts = OPTS.concat({
    'pkg@version': `${deprecated.name}@<0.0.2`,
    message: deprecated.versions['0.0.1'].deprecated
  })

  // Setup mock registry server
  tnock(t, opts.registry).get('/cond?write=true').reply(200, cache)
  tnock(t, opts.registry).put('/cond', deprecated).reply(201, { deprecated: true })

  // Run the function
  const res = await deprecate([], opts)

  // Verify the result
  t.equal(res.status, 201)
})

test('tink deprecate bad semver range', async t => {
  // Clone OPTS and modify it for this test
  const opts = OPTS.concat({
    'pkg@version': `${cache.name}@-9001`,
    message: 'make it dead'
  })

  // Test that an exception is thrown
  t.rejects(deprecate([], opts), 'invalid version range: -9001')
})

test('tink deprecate a package with no semver range', async t => {
  // Clone cache and modify it for this test
  const deprecated = JSON.parse(JSON.stringify(cache))
  deprecated.versions = {
    '0.0.0': { deprecated: 'make it dead' },
    '0.0.1': { deprecated: 'make it dead' },
    '0.0.2': { deprecated: 'make it dead' }
  }

  // Clone OPTS and modify it for this test
  const opts = OPTS.concat({
    'pkg@version': deprecated.name,
    message: deprecated.versions['0.0.0'].deprecated
  })

  // Setup mock registry server
  tnock(t, opts.registry).get('/cond?write=true').reply(200, cache)
  tnock(t, opts.registry).put('/cond', deprecated).reply(201, { deprecated: true })

  // Run the function
  const res = await deprecate([], opts)

  // Verify the result
  t.equal(res.status, 201)
})
