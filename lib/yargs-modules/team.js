'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const Team = module.exports = {
  command: 'team',
  describe: 'Used to manage teams in organizations, and change team memberships.',
  aliases: ['t'],
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Team.options)
      .demandCommand(1, 'Team subcommand is required')
      .recommendCommands()
      .command({
        command: 'create <scope:team>',
        aliases: ['c'],
        describe: 'Create a new team',
        builder: (y) => y.help().alias('help', 'h').options(Team.options),
        handler: mkCmd((argv, opts) => require('../commands/team.js').create(argv['scope:team'], opts))
      })
      .command({
        command: 'destroy <scope:team>',
        aliases: ['d'],
        describe: 'Destroy an existing team',
        builder: (y) => y.help().alias('help', 'h').options(Team.options),
        handler: mkCmd((argv, opts) => require('../commands/team.js').destroy(argv['scope:team'], opts))
      })
      .command({
        command: 'add <scope:team> <user>',
        aliases: ['a'],
        describe: 'Add a user to an existing team',
        builder: (y) => y.help().alias('help', 'h').options(Team.options),
        handler: mkCmd((argv, opts) => require('../commands/team.js').add(argv['scope:team'], argv.user, opts))
      })
      .command({
        command: 'rm <scope:team> <user>',
        aliases: ['r'],
        describe: 'Remove a user from a team they belong to',
        builder: (y) => y.help().alias('help', 'h').options(Team.options),
        handler: mkCmd((argv, opts) => require('../commands/team.js').rm(argv['scope:team'], argv.user, opts))
      })
      .command({
        command: 'ls <name>',
        aliases: ['l'],
        describe: 'If performed on an organization name, will return a list of existing teams under that organization. If performed on a team, it will instead return a list of all users belonging to that particular team.',
        builder: (y) => y.help().alias('help', 'h').options(Team.options),
        handler: mkCmd((argv, opts) => {
          return require('../commands/team.js').ls(argv.name, opts)
        })
      })
      .command({
        command: 'edit',
        aliases: ['e'],
        describe: 'Edit an existing team',
        builder: (y) => y.help().alias('help', 'h').options(Team.options),
        handler: () => console.log('`npm team edit` is not implemented yet.')
      })
  },
  options: Object.assign(require('../common-opts.js', {}))
}
