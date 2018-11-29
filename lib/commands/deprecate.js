'use strict'

const BB = require('bluebird')

const fetch = require('libnpm/fetch')
const figgyPudding = require('figgy-pudding')
const otplease = require('../utils/otplease.js')
const parseArg = require('libnpm/parse-arg')
const semver = require('semver')

const DeprecateConfig = figgyPudding({
  json: {},
  loglevel: {},
  message: {},
  parseable: {},
  silent: {},
  'pkg@version': {}
})

module.exports = deprecate
async function deprecate (argv, opts) {
  opts = DeprecateConfig(opts)

  return BB.try(() => {
    // fetch the data and make sure it exists.
    const p = parseArg(opts['pkg@version'])

    // npa makes the default spec "latest", but for deprecation
    // "*" is the appropriate default.
    const spec = p.rawSpec === '' ? '*' : p.fetchSpec

    if (semver.validRange(spec, true) === null) {
      throw new Error('invalid version range: ' + spec)
    }

    const uri = '/' + p.escapedName
    return fetch.json(uri, opts.concat({
      spec: p,
      query: { write: true }
    })).then(packument => {
      // filter all the versions that match
      Object.keys(packument.versions)
        .filter(v => semver.satisfies(v, spec))
        .forEach(v => { packument.versions[v].deprecated = opts.message })
      return otplease(opts, opts => fetch(uri, opts.concat({
        spec: p,
        method: 'PUT',
        body: packument,
        ignoreBody: true
      })))
    })
  })
}
