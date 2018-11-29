'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const Access = module.exports = {
  command: 'access',
  describe: 'access-related subcommands',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Access.options)
      .demandCommand(1, 'Access subcommand is required')
      .recommendCommands()
      .command(
        'public <spec>',
        'Set a package to be publicly accessible',
        Access.options,
        mkCmd((...args) => require('../commands/access.jsx').public(...args))
      )
      .command(
        'restricted <spec>',
        'Set a package to be restricted',
        Access.options,
        mkCmd((...args) => require('../commands/access.jsx').restricted(...args))
      )
      .command(
        'grant <permissions> <team> <spec>',
        'Add the ability of users and teams to have read-only or ' +
          'read-write access to a package',
        Access.options,
        mkCmd((...args) => require('../commands/access.jsx').grant(...args))
      )
      .command(
        'revoke <team> <spec>',
        'Remove the ability of users and teams to have read-only or ' +
          'read-write access to a package',
        Access.options,
        mkCmd((...args) => require('../commands/access.jsx').revoke(...args))
      )
      .command(
        'ls-packages [<entity>]',
        'Show all of the packages a user or a team is able to access, along ' +
          'with the access level, except for read-only public packages',
        Access.options,
        mkCmd((...args) => require('../commands/access.jsx').lsPackages(...args))
      )
      .command(
        'ls-collaborators [<spec> [<user>]]',
        'Show all of the access privileges for a package. Will only show ' +
          'permissions for packages to which you have at least read access. ' +
          'If <user> is passed in, the list is filtered only to teams that ' +
          'user happens to belong to',
        Access.options,
        mkCmd((...args) => require('../commands/access.jsx').lsCollaborators(...args))
      )
      .command(
        'edit <package>',
        'Set the access privileges for a package at once using $EDITOR',
        Access.options,
        mkCmd((...args) => require('../commands/access.jsx').edit(...args))
      )
  },
  options: Object.assign(require('../common-opts.js', {}))
}
