'use strict'

const os = require('os')
const path = require('path')

module.exports = {
  cache: {
    default: path.join(os.homedir(), '.tink'),
    describe: 'Path to the global tink cache',
    hidden: true
  },
  json: {
    default: false,
    describe: 'Output in JSON format.',
    choices: [false, true],
    hidden: true
  },
  loglevel: {
    default: 'warn',
    alias: ['log', 'l'],
    describe: 'Logger output level.',
    choices: ['silent', 'error', 'warn', 'http', 'verbose', 'info', 'notice', 'silly'],
    hidden: true
  },
  registry: {
    alias: 'r',
    default: 'https://registry.npmjs.org',
    describe: 'Registry to ping',
    hidden: true
  },
  userconfig: {
    default: path.join(os.homedir(), '.npmrc'),
    describe: 'Path to user config file.',
    hidden: true
  }
}
