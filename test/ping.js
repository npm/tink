'use strict'

const { log } = require('libnpm')
const { test } = require('tap')
const tnock = require('./util/tnock.js')

log.level = process.env.LOGLEVEL || 'silent'
const OPTS = {
  registry: 'https://mock.reg',
  log,
  loglevel: log.level
}

const ping = require('../lib/commands/ping.js')

test('pings the server', async t => {
  tnock(t, OPTS.registry).get('/-/ping?write=true').reply(200, { ok: true })
  const res = await ping.handler(OPTS)
  t.deepEqual(res, { ok: true }, 'got pong')
})
