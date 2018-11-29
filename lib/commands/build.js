'use strict'

const libnpm = require('libnpm')
const figgyPudding = require('figgy-pudding')

const BuildConfig = figgyPudding({
  log: { default: () => require('npmlog') },
  dir: { default: () => process.cwd() },
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

module.exports = build
async function build (argv, opts) {
  opts = BuildConfig(opts)

  const prefix = await libnpm.getPrefix(process.cwd())
  const packageJSON = `${prefix}/package.json`
  const pkg = await libnpm.readJSON(packageJSON)

  await libnpm.runScript(pkg, 'build', opts.dir, opts)
  return true
}
