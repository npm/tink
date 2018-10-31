'use strict'

const os = require('os')
const path = require('path')

module.exports = {
  command: 'shell [script] [arguments...]',
  aliases: ['sh'],
  describe: 'Launch a tink shell or execute a script',
  builder (yargs) {
    return yargs.help().alias('help', 'h').options({
      cache: {
        default: path.join(os.homedir(), '.tink'),
        describe: 'Path to the global tink cache'
      },
      'ignore-scripts': {},
      loglevel: {
        default: 'warn',
        describe: 'Logger output level',
        choices: ['silent', 'error', 'warn', 'http', 'verbose', 'info', 'notice']
      },
      'node-arg': {
        alias: 'nodeArg',
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
      },
      userconfig: {
        default: path.join(os.homedir(), '.tinkrc')
      }
    })
  },
  // lazy-load subcommands
  handler (argv) { return require('../shell.js')(argv) }
}
