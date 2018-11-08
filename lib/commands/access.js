'use strict'

const Access = module.exports = {
  command: 'access',
  describe: 'access-related subcommands',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Access.options)
      .demandCommand(1, 'Access subcommand is required')
      .recommendCommands()
      .command(
        'public [<package>]',
        'Set a package to be publicly accessible',
        Access.options,
        async argv => accessPublic(argv)
      )
      .command(
        'restricted [<package>]',
        'Set a package to be restricted',
        Access.options,
        async argv => accessRestricted(argv)
      )
      .command(
        'grant <read-only|read-write> <scope:team> [<package>]',
        'Add the ability of users and teams to have read-only or ' +
          'read-write access to a package',
        Access.options,
        async argv => accessGrant(argv)
      )
      .command(
        'revoke <scope:team> [<package>]',
        'Remove the ability of users and teams to have read-only or ' +
          'read-write access to a package',
        Access.options,
        async argv => accessRevoke(argv)
      )
      .command(
        'ls-packages [<user>|<scope>|<scope:team>]',
        'Show all of the packages a user or a team is able to access, along ' +
          'with the access level, except for read-only public packages',
        Access.options,
        async argv => accessLsPackages(argv)
      )
      .command(
        'ls-collaborators [<package> [<user>]]',
        'Show all of the access privileges for a package. Will only show ' +
          'permissions for packages to which you have at least read access. ' +
          'If <user> is passed in, the list is filtered only to teams that ' +
          'user happens to belong to',
        Access.options,
        async argv => accessLsCollaborators(argv)
      )
      .command(
        'edit [<package>]',
        'Show all of the access privileges for a package. Will only show ' +
          'permissions for packages to which you have at least read access. ' +
          'If <user> is passed in, the list is filtered only to teams that ' +
          'user happens to belong to',
        Access.options,
        async argv => accessEdit(argv)
      )
  },
  options: Object.assign(require('../common-opts.js', {}))
}

async function accessPublic (argv) {
  // TODO: stub
}

async function accessRestricted (argv) {
  // TODO: stub
}

async function accessGrant (argv) {
  // TODO: stub
}

async function accessRevoke (argv) {
  // TODO: stub
}

async function accessLsPackages (argv) {
  // TODO: stub
}

async function accessLsCollaborators (argv) {
  // TODO: stub
}

async function accessEdit (argv) {
  // TODO: stub
}
