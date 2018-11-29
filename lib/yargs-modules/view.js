'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const View = module.exports = {
  command: 'view [<pkg>[@<version>]] [<field>...]',
  aliases: ['v', 'info', 'show'],
  describe: 'Show information about a package',
  builder (yargs) {
    return yargs.help().alias('help', 'h').options(View.options)
  },
  options: Object.assign(require('../common-opts'), {}),
  handler: mkCmd((...args) => require('../commands/view.js')(...args))
}
