'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const Add = module.exports = {
  command: 'add <packages...>',
  describe: 'Add a dependency.',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Add.options)
  },
  options: Object.assign(require('../common-opts.js', {
    'development': {
      alias: ['dev', 'D'],
      describe: 'Add this dependency as a devDependency',
      type: 'boolean'
    },
    'production': {
      alias: ['prod', 'P'],
      describe: 'Add this dependency as a regular dependency',
      type: 'boolean',
      default: true
    },
    'bundle': {
      alias: ['bundled', 'B'],
      describe: 'Add this dependency as a bundledDependency',
      type: 'boolean'
    }
  })),
  handler: mkCmd((...args) => require('../commands/add.js')(...args))
}
