'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const Remove = module.exports = {
  command: 'rm <pkg>',
  describe: 'Remove a dependency.',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Remove.options)
  },
  options: Object.assign(require('../common-opts.js', {
    'development': {
      alias: ['dev', 'D'],
      describe: 'Remove this dependency as a devDependency',
      type: 'boolean'
    },
    'production': {
      alias: ['prod', 'P'],
      describe: 'Remove this dependency as a regular dependency',
      type: 'boolean',
      default: true
    },
    'bundle': {
      alias: ['bundled', 'B'],
      describe: 'Remove this dependency as a bundledDependency',
      type: 'boolean'
    }
  })),
  handler: mkCmd((...args) => require('../commands/rm.js')(...args))
}
