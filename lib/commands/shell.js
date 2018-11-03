'use strict'

module.exports = {
  command: 'shell',
  aliases: ['sh'],
  describe: 'Launch a tink shell or execute a script',
  builder (yargs) {
    return yargs.help().alias('help', 'h').options({
      'ignore-scripts': {},
      'node-arg': {
        alias: ['n', 'nodeArg'],
        describe: 'Arguments to pass down directly to node',
        type: 'array'
      },
      prefix: {
        describe: 'Directory to execute package management operations in.',
        type: 'string'
      },
      'restore-missing': {
        default: true,
        type: 'boolean'
      }
    })
  },
  // lazy-load subcommands
  handler: shell
}

function shell (argv) {
  const cp = require('child_process')
  const prepare = require('./prepare.js')

  prepare.handler(argv)
  if (argv.nodeArg && argv.nodeArg.length) {
    cp.spawnSync(
      process.argv[0],
      ['-r', require.resolve('../node'), ...(argv.nodeArg || []), ...(argv.script ? [argv.script, ...(argv.arguments || [])] : [])],
      { stdio: 'inherit' }
    )
  } else if (argv._.length > 1) {
    const Module = require('module')
    require('clear-module').all()
    process.argv = [
      process.argv[0],
      ...argv._.slice(1)
    ]
    Module.runMain()
  } else {
    const { createRepl } = require('../node/repl.js')
    createRepl(process.env, {}, (err, repl) => {
      if (err) {
        throw err
      }
      repl.on('exit', function () {
        if (repl._flushing) {
          repl.pause()
          return repl.once('flushHistory', function () {
            process.exit()
          })
        }
        process.exit()
      })
    })
  }
}
