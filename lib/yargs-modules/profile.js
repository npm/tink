'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const ProfileSubcommandsOptions = {
  token: {
    alias: 't',
    describe: 'Used for Bearer auth',
    type: 'string'
  },
  username: {
    alias: 'u',
    describe: 'Used for Basic auth',
    type: 'string'
  },
  password: {
    alias: 'p',
    describe: 'Used for Basic auth',
    type: 'string'
  }
}

const Profile = module.exports = {
  command: 'profile',
  describe: 'Provides functions for fetching and updating an npmjs.com profile.',
  aliases: ['p'],
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Profile.options)
      .demandCommand(1, 'Profile subcommand is required')
      .recommendCommands()
      .command({
        command: 'get [<property>]',
        describe: 'Display all of the properties of your profile, or one or more specific properties.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: mkCmd((...args) => require('../commands/profile.jsx').get(...args))
      })
      .command({
        command: 'set <property> <value>',
        describe: 'Update profile information for the authenticated user.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: mkCmd((...args) => require('../commands/profile.jsx').set(...args))
      })
      .command({
        command: 'set password',
        describe: 'Update password',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: mkCmd((...args) => require('../commands/profile.jsx').setPassword(...args))
      })
      .command({
        command: 'disable-2fa',
        describe: 'Disable two-factor authentication.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: mkCmd((...args) => require('../commands/profile.jsx').disable2fa(...args))
      })
      .command({
        command: 'enable-2fa [<mode>]',
        describe: 'Enable two-factor authentication. ',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: mkCmd((...args) => require('../commands/profile.jsx').enable2fa(...args))
      })
      .command({
        command: 'create-token',
        describe: 'Create a new authentication token, possibly with restrictions.',
        builder: y => y.help('help', 'h').options(Object.assign({}, ProfileSubcommandsOptions, {
          'read-only': {
            alias: 'ro',
            describe: 'Readonly',
            type: 'boolean',
            default: false
          },
          cidr_whitelist: {
            alias: 'cidr',
            describe: 'CIDR ranges to limit use of this token to.',
            type: 'array',
            default: []
          }
        })),
        handler: mkCmd((...args) => require('../commands/profile.jsx').createToken(...args))
      })
      .command({
        command: 'remove-token <token|key>',
        aliases: ['revoke-token', 'rm'],
        describe: 'Remove a specific authentication token.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: mkCmd((...args) => require('../commands/profile.jsx').removeToken(...args))
      })
      .command({
        command: 'list-tokens',
        aliases: ['lt'],
        describe: 'Fetch a list of all of the authentication tokens the authenticated user has.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: mkCmd((...args) => require('../commands/profile.jsx').listTokens(...args))
      })
  },
  options: Object.assign({}, require('../common-opts'), {})
}
