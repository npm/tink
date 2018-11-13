'use strict'
const Build = module.exports = {
  command: 'build',
  describe: 'Executes the configured build script, if present, or executes ' +
    ' silently',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Build.options)
  },
  options: Object.assign(require('../common-opts.js', {})),
  handler: async argv => build(argv)
}

async function build (argv) {
  const findPrefix = require('find-npm-prefix')
  const readJson = require('read-package-json')
  const figgyPudding = require('figgy-pudding')
  const npmConfig = require('../config.js')
  const libnpm = require('libnpm')
  const log = require('npmlog')

  const cwd = process.cwd()
  const BuildConfig = figgyPudding({
    log: { default: () => log },
    dir: { default: cwd },
    production: { default: false },
    nodeOptions: { default: {} },
    config: { default: {} },
    unsafePerm: { default: false },
    scriptsPrependNodePath: { default: false },
    ignoreScripts: { default: false },
    user: {},
    group: {},
    stdio: {},
    scriptShell: {}
  })
  const opts = BuildConfig(npmConfig().concat(argv).concat({ log }))

  findPrefix(process.cwd()).then(prefix => {
    const packageJson = `${prefix}/package.json`
    readJson(
      packageJson,
      console.error,
      false,
      async (er, data) => {
        if (er) {
          console.error(`There was an error reading ${packageJson}`)
        }
        if (data) {
          await libnpm.runScript(data, 'build', cwd, opts)
            .catch(e => console.error(e))
        }
      }
    )
  })
}
