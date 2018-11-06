'use strict'

const os = require('os')
const path = require('path')

module.exports = {
  cache: {
    default: path.join(os.homedir(), '.tink'),
    describe: 'Path to the global tink cache'
  },
  json: {
    default: false,
    describe: 'Output in JSON format.',
    type: 'boolean'
  },
  loglevel: {
    default: 'notice',
    alias: ['log', 'l'],
    describe: 'Logger output level.',
    choices: ['silent', 'error', 'warn', 'http', 'verbose', 'info', 'notice', 'silly']
  },
  registry: {
    alias: 'r',
    default: 'https://registry.npmjs.org',
    describe: 'Registry to ping'
  },
  userconfig: {
    default: path.join(os.homedir(), '.npmrc'),
    describe: 'Path to user config file.'
  },
  force: {
    type: 'boolean',
    describe: 'Force an action (use with care). This should be defined per-command.'
  },
  log: {},
  prefix: {},
  then: {}
}

Object.keys(module.exports).forEach(k => {
  module.exports[k].hidden = true
})
