'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const WhoAmI = (module.exports = {
  command: 'whoami [--registry <registry>]',
  aliases: ['wh'],
  describe: 'Prints username according to given registry',
  builder (yargs) {
    return yargs
      .help()
      .alias('help', 'h')
      .options(WhoAmI.options)
  },
  options: Object.assign(require('../common-opts'), {}),
  handler: mkCmd((...args) => require('../commands/whoami.js')(...args))
})
