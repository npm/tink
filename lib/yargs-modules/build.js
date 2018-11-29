'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const Build = module.exports = {
  command: 'build',
  describe: 'Executes the configured build script, if present, or executes ' +
    ' silently',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Build.options)
  },
  options: Object.assign(require('../common-opts.js', {})),
  handler: mkCmd((...args) => require('../commands/build.js')(...args))
}
