'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const Prepare = module.exports = {
  command: 'prepare [packages...]',
  aliases: ['prep'],
  describe: 'pre-fetch dependencies, or only the listed ones',
  builder (y) {
    return y.help().alias('help', 'h').options(Prepare.options)
  },
  options: Object.assign(require('../common-opts.js'), {
    force: {
      alias: 'f',
      describe: 'Unconditionally prepare dependencies.',
      type: 'boolean'
    }
  }),
  handler: mkCmd((...args) => require('../commands/prepare.js')(...args))
}
