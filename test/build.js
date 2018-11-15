'use strict'

const { test } = require('tap')
const build = require('../lib/commands/build.js')

test('execute "build" handler & assert truthy returned value', async t => {
  t.equal(await build.handler(), true)
})
