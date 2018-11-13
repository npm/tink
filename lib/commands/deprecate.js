'use strict'

const Deprecate = module.exports = {
  command: 'deprecate <pkg>[@<version>] <message>',
  describe: 'Deprecate a version of a package',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Deprecate.options)
  },
  options: Object.assign(require('../common-opts.js', {})),
  handler: async argv => deprecate(argv)
}

async function deprecate (argv) {
  const BB = require('bluebird')

  const figgyPudding = require('figgy-pudding')
  const libnpm = require('libnpm')
  const npmConfig = require('../config.js')
  const semver = require('semver')
  const otplease = require('../utils/otplease.js')

  const DeprecateConfig = figgyPudding({
    json: {},
    loglevel: {},
    parseable: {},
    silent: {}
  })

  const opts = DeprecateConfig(npmConfig().concat(argv).concat({
    log: require('npmlog')
  }))

  return BB.try(() => {
    // fetch the data and make sure it exists.
    const p = libnpm.parseArg(argv['pkg@version'])

    // npa makes the default spec "latest", but for deprecation
    // "*" is the appropriate default.
    const spec = p.rawSpec === '' ? '*' : p.fetchSpec

    if (semver.validRange(spec, true) === null) {
      throw new Error('invalid version range: ' + spec)
    }

    const uri = '/' + p.escapedName
    return libnpm.fetch.json(uri, opts.concat({
      spec: p,
      query: { write: true }
    })).then(packument => {
      // filter all the versions that match
      Object.keys(packument.versions)
        .filter(v => semver.satisfies(v, spec))
        .forEach(v => { packument.versions[v].deprecated = argv.message })
      return otplease(opts, opts => libnpm.fetch(uri, opts.concat({
        spec: p,
        method: 'PUT',
        body: packument,
        ignoreBody: true
      })))
    })
  })
}
