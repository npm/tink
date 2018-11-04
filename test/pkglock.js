'use strict'

const cacache = require('cacache')
const npa = require('npm-package-arg')
const path = require('path')
const rimraf = require('rimraf')
const Tacks = require('tacks')
const { test } = require('tap')
const testDir = require('./util/test-dir.js')

const { File, Dir } = Tacks

const pkglock = require('../lib/pkglock.js')

test('UNIT depKey', t => {
  const regDep = {
    version: '1.2.3',
    resolved: 'https://reg.reg/foo-1.2.3.tgz',
    integrity: 'sha1-deadbeef'
  }
  const regSpec = npa('foo@1.2.3')
  t.equal(
    pkglock.depKey(regSpec, regDep),
    `tinked-package:${pkglock.INDEX_VERSION}:sha1-deadbeef`,
    'registry only uses integrity if present'
  )
  delete regDep.integrity
  t.equal(
    pkglock.depKey(regSpec, regDep),
    `tinked-package:${pkglock.INDEX_VERSION}:https://reg.reg/foo-1.2.3.tgz`,
    'no integrity -> use resolved'
  )
  delete regDep.resolved
  t.equal(
    pkglock.depKey(regSpec, regDep),
    `tinked-package:${pkglock.INDEX_VERSION}:foo@1.2.3`,
    'no integrity or resolved -> use raw spec'
  )
  const gitDep = {
    version: 'git://foo#deadbeef',
    integrity: 'sha1-deadbeef'
  }
  const gitSpec = npa('zkat/foo')
  t.equal(
    pkglock.depKey(gitSpec, gitDep),
    `tinked-package:${pkglock.INDEX_VERSION}:git:git://foo#deadbeef`,
    'git deps use version, ignoring integrity'
  )
  const remoteSpec = npa('foo@https://reg.net/foo.tgz')
  const remoteDep = {
    version: 'https://reg.net/foo.tgz',
    integrity: 'sha1-badc0ffee'
  }
  t.equal(
    pkglock.depKey(remoteSpec, remoteDep),
    `tinked-package:${pkglock.INDEX_VERSION}:sha1-badc0ffee`,
    'remote w/ integrity -> use integrity'
  )
  delete remoteDep.integrity
  t.equal(
    pkglock.depKey(remoteSpec, remoteDep),
    `tinked-package:${pkglock.INDEX_VERSION}:https://reg.net/foo.tgz`,
    'remote w/o integrity -> use version'
  )
  const localSpec = npa('foo@./idk.tgz')
  const localDep = {
    version: 'file:idk.tgz',
    integrity: 'sha1-deadbeef'
  }
  t.equal(
    pkglock.depKey(localSpec, localDep),
    `tinked-package:${pkglock.INDEX_VERSION}:foo:file:idk.tgz:undefined:sha1-deadbeef`,
    'local file -> fallthrough to default'
  )
  t.done()
})
