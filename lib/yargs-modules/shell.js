'use strict'

const Shell = module.exports = {
  command: 'shell',
  aliases: ['sh'],
  describe: 'Launch a tink shell or execute a script',
  builder (yargs) {
    return yargs.help().alias('help', 'h').options(Shell.options)
  },
  options: Object.assign({}, require('../common-opts'), {
    _: { default: [] },
    'ignore-scripts': {},
    nodeArg: {
      alias: ['n', 'node-arg'],
      describe: 'Arguments to pass down directly to node',
      type: 'array'
    },
    prefix: {
      alias: 'C',
      describe: 'Directory to execute package management operations in.',
      type: 'string'
    },
    restore: {
      alias: 'restore-missing',
      default: true,
      type: 'boolean'
    },
    also: {
      hidden: true
    },
    dev: {
      hidden: true
    },
    development: {
      hidden: true
    },
    only: {
      hidden: true
    },
    production: {
      type: 'boolean',
      describe: 'Limit downloads to production dependencies, skipping devDependencies.'
    }
  }),
  handler: require('../utils/cmd-handler.js')('../commands/shell.js')
}
