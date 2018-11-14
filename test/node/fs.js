'use strict'

const fs = require('fs')
const path = require('path')
const tap = require('tap')
const { overrideNode } = require('../../lib/node/fs')

overrideNode()

tap.test('lstatSync', function (test) {
  const stat = fs.lstatSync(path.resolve('test'))
  test.ok(stat, 'lstatSync should return valid result')
  test.true(stat.isDirectory(), 'lstatSync should set isDirectory true')
  test.end()
})

tap.test('lstatSync', function (test) {
  try {
    fs.lstatSync(path.resolve(`foo-${Date.now()}-test`))
    test.fail('expect lstatSync to throw')
  } catch (err) {}
  test.end()
})

tap.test('lstat', function (test) {
  fs.lstat(path.resolve('test'), (err, stat) => {
    test.notOk(err, `lstat should not fail with error`)
    test.ok(stat, 'lstat should return valid result')
    test.true(stat.isDirectory(), 'lstat should set isDirectory true')
    test.end()
  })
})

tap.test('lstat', function (test) {
  fs.lstat(path.resolve(`foo-${Date.now()}-test`), (err, stat) => {
    test.ok(err, 'expect lstat to fail')
    test.end()
  })
})

tap.test('statSync', function (test) {
  const stat = fs.statSync(path.resolve('test'))
  tap.ok(stat, 'statSync should return valid result')
  tap.true(stat.isDirectory(), 'statSync should set isDirectory true')
  test.end()
})

tap.test('statSync', function (test) {
  try {
    fs.statSync(path.resolve(`foo-${Date.now()}-test`))
    test.fail('expect statSync to throw')
  } catch (err) {}
  test.end()
})

tap.test('stat', function (test) {
  fs.stat(path.resolve('test'), (err, stat) => {
    test.notOk(err, `stat should not fail with error`)
    test.ok(stat, 'stat should return valid result')
    test.true(stat.isDirectory(), 'stat should set isDirectory true')
    test.end()
  })
})

tap.test('stat', function (test) {
  fs.stat(path.resolve(`foo-${Date.now()}-test`), (err, stat) => {
    test.ok(err, 'expect stat to fail')
    test.end()
  })
})

tap.test('realpathSync', function (test) {
  const rp = fs.realpathSync('.')
  test.equal(rp, process.cwd(), 'realpathSync should return cwd')
  test.end()
})

tap.test('realpath', function (test) {
  fs.realpath('.', (err, rp) => {
    test.notOk(err, 'realpath should not fail')
    test.equal(rp, process.cwd(), 'realpath should return cwd')
    test.end()
  })
})

tap.test('existsSync', function (test) {
  const flag = fs.existsSync(path.resolve('test'))
  test.equal(flag, true, 'exists should return true')
  test.end()
})
