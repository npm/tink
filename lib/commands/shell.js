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

  setupEnv(opts)
  launchShell(argv, opts)

  function setupEnv (opts) {
    process.tink = {
      cache: path.resolve(opts.cache),
      config: opts
    }
    if (opts.production) {
      process.tink.config = figgyPudding({
        production: { default: true }
      })()
    }
  }

  function launchShell (argv, opts) {
    // TODO - remove argv._.length check when next clause can be made to
    //        work with `esm`.
    if (argv._.length || (opts.nodeArg && opts.nodeArg.length)) {
      cp.spawnSync(
        process.argv[0],
        ['-r', require.resolve('esm'), '-r', require.resolve('../node/index.js'), ...(opts.nodeArg || []), ...argv._.slice(1)],
        { stdio: 'inherit' }
      )
    } else if (argv._.length > 1) {
      // TODO - try to hook up to `esm`
      require('../node/index.js')
      const Module = require('module')
      process.argv = [
        process.argv[0],
        path.resolve(argv._[1]),
        ...argv._.slice(2)
      ]
      Module.runMain()
    } else {
      require('../node/index.js')
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
