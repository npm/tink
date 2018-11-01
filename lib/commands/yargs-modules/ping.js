'use strict'

module.exports = {
  command: 'ping',
  describe: 'ping registry',
  builder (yargs) {
    return yargs.help().alias('help', 'h').options({
      json: {
        alias: 'j',
        default: false,
        describe: 'Output in JSON format',
        choices: [false, true]
      },
      loglevel: {
        default: 'warn',
        describe: 'Logger output level',
        choices: ['silent', 'error', 'warn', 'http', 'verbose', 'info', 'notice']
      },
      silent: {
        alias: 's',
        default: false,
        describe: 'Do not display the PONG response',
        choices: [false, true]
      },
      registry: {
        alias: 'r',
        default: 'https://registry.npmjs.org',
        describe: 'Registry to ping'
      }
    })
  },
  // lazy-load subcommands
  handler (argv) { return require('../ping.js')(argv) }
}
