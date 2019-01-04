'use strict'

const cp = require('child_process')
const figgyPudding = require('figgy-pudding')
const path = require('path')

const ShellOpts = figgyPudding({
  cache: {},
  nodeArg: {},
  production: {}
})

module.exports = shell
async function shell (argv, opts) {
  opts = ShellOpts(opts)

  await require('./prepare.js')(argv, opts)
  launchShell(argv, opts)

  function launchShell (argv, opts) {
    if (opts.nodeArg && opts.nodeArg.length) {
      cp.spawnSync(
        process.argv[0],
        ['-r', require.resolve('esm'), '-r', require.resolve('../node/index.js'), ...(opts.nodeArg || []), ...argv._.slice(1)],
        { stdio: 'inherit' }
      )
    } else if (argv._.length > 1) {
      const Module = module.constructor
      const fname = path.resolve(argv._[1])
      const mod = new Module(fname, null)
      process.mainModule = mod
      mod.id = '.'
      mod.load(fname)
    } else {
      const { createRepl } = require('../node/repl.js')
      createRepl(process.env, {}, (err, repl) => {
        if (err) {
          throw err
        }
        repl.on('exit', () => {
          if (repl._flushing) {
            repl.pause()
            return repl.once('flushHistory', () => process.exit())
          }
          process.exit()
        })
      })
    }
  }
}
