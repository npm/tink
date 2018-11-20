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
  const libnpm = require('libnpm')
  const figgyPudding = require('figgy-pudding')
  const npmConfig = require('../config.js')
  const log = require('npmlog')

  const cwd = process.cwd()
  const BuildConfig = figgyPudding({
    log: {},
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
  const prefix = await libnpm.getPrefix(process.cwd())
  const packageJSON = `${prefix}/package.json`
  const pkg = await libnpm.readJSON(packageJSON)

  await libnpm.runScript(pkg, 'build', cwd, opts)
  return true
}
