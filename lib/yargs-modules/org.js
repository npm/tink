'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const Org = module.exports = {
  command: 'org',
  describe: 'org-related subcommands',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Org.options)
      .demandCommand(1, 'Org subcommand is required')
      .recommendCommands()
      .command(
        ['add <org> <user> [role]', 'set'],
        'Add someone to an org',
        Org.options,
        mkCmd((...args) => require('../commands/org.jsx').add(...args))
      )
      .command(
        'rm <org> <user>',
        'Remove someone from an org',
        Org.options,
        mkCmd((...args) => require('../commands/org.jsx').rm(...args))
      )
      .command(
        'ls <org>',
        'List org members',
        Org.options,
        mkCmd((...args) => require('../commands/org.jsx').ls(...args))
      )
  },
  options: Object.assign(require('../common-opts.js', {}))
}
