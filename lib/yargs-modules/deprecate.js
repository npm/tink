'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const Deprecate = module.exports = {
  command: 'deprecate <pkg>[@<version>] <message>',
  describe: 'Deprecate a version of a package',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Deprecate.options)
  },
  options: Object.assign(require('../common-opts.js', {})),
  handler: mkCmd((...args) => require('../commands/deprecate.js')(...args))
}
