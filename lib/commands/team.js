/* eslint-disable standard/no-callback-literal */

const figgyPudding = require('figgy-pudding')
const libteam = require('libnpmteam')
const log = require('npmlog')
const npmConfig = require('../config.js')

const Team = module.exports = {
  command: 'team',
  describe: 'Used to manage teams in organizations, and change team memberships. Does not handle permissions for packages.',
  aliases: ['t'],
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Team.options)
      .demandCommand(1, 'Team subcommand is required')
      .recommendCommands()
      .command({
        command: 'create',
        aliases: ['c'],
        describe: 'Create a new team',
        builder: (y) => y.help().alias('help', 'h').options({
          'scope': {
            alias: 's',
            describe: 'Organization name. For example: @npm',
            type: 'string',
            demandOption: true
          },
          'name': {
            alias: 'n',
            describe: 'Name of the team. For example: cli',
            type: 'string',
            demandOption: true
          }
        }),
        handler: (argv) => teamCreate(`${argv.scope}:${argv.name}`, getOpts(argv))
      })
      .command({
        command: 'destroy',
        aliases: ['d'],
        describe: 'Destroy an existing team',
        builder: (y) => y.help().alias('help', 'h').options({
          'scope': {
            alias: 's',
            describe: 'Organization name. For example: @npm',
            type: 'string',
            demandOption: true
          },
          'name': {
            alias: 'n',
            describe: 'Name of the team to be destroyed',
            type: 'string',
            demandOption: true
          }
        }),
        handler: (argv) => teamDestroy(`${argv.scope}:${argv.name}`, getOpts(argv))
      })
      .command({
        command: 'add',
        aliases: ['a'],
        describe: 'Add a user to an existing team',
        builder: (y) => y.help().alias('help', 'h').options({
          'scope': {
            alias: 's',
            describe: 'Organization name. For example: @npm',
            type: 'string',
            demandOption: true
          },
          'name': {
            alias: 'n',
            describe: 'Name of the team',
            type: 'string',
            demandOption: true
          },
          'user': {
            alias: 'u',
            describe: 'Name of the user to be added to the team',
            type: 'string',
            demandOption: true
          }
        }),
        handler:  (argv) => teamAdd(`${argv.scope}:${argv.name}`, argv.user, getOpts(argv))
      })
      .command({
        command: 'rm',
        aliases: ['r'],
        describe: 'Remove a user from a team they belong to',
        builder: (y) => y.help().alias('help', 'h').options({
          'scope': {
            alias: 's',
            describe: 'Organization name. For example: @npm',
            type: 'string',
            demandOption: true
          },
          'name': {
            alias: 'n',
            describe: 'Name of the team',
            type: 'string',
            demandOption: true
          },
          'user': {
            alias: 'u',
            describe: 'Name of the user to be removed from the team',
            type: 'string',
            demandOption: true
          }
        }),
        handler: (argv) => teamRm(`${argv.scope}:${argv.name}`, argv.user, getOpts(argv))
      })
      .command({
        command: 'ls',
        aliases: ['l'],
        describe: 'If performed on an organization name, will return a list of existing teams under that organization. If performed on a team, it will instead return a list of all users belonging to that particular team.',
        builder: (y) => y.help().alias('help', 'h').options({
          'name': {
            alias: 'n',
            describe: 'Name of the organization. For example: npm \n Or the name of the team. For example: npm:cli',
            type: 'string',
            demandOption: true
          }
        }),
        handler: (argv) => argv.name[0].match(/[^:]+:.+/) ? teamListUsers(argv.name[0], getOpts(argv)) : teamListTeams(argv.name[0], getOpts(argv))
      })
      .command({
        command: 'edit',
        aliases: ['e'],
        describe: 'Edit an existing team',
        builder: (y) => y.help().alias('help', 'h'),
        handler: () => console.log('`npm team edit` is not implemented yet.') 
      })
  },
  options: Object.assign(require('../common-opts.js', {}))
}

const TeamConfig = figgyPudding({
  json: {},
  loglevel: {},
  parseable: {},
  silent: {},
  token: {},
  registry: {}
})

const getOpts = (argv) => TeamConfig(npmConfig().concat(argv).concat({ log }))

const logError = (err) => console.log(`Error code: ${err.code} => ${err.message}`);

const logUsersAndTeams = (arr) => arr.forEach((item) => console.log(item));

const teamCreate = async (entity, opts) => {
  try {
    await libteam.create(entity, opts)
    if (opts.json) {
      console.log(JSON.stringify({
        created: true,
        team: entity
      }))
    } else if (opts.parseable) console.log(`${entity}\tcreated`)
    else if (!opts.silent && opts.loglevel !== 'silent') console.log(`+@${entity}`)
  } catch (e) { logError(e) }
}

const teamDestroy = async (entity, opts) => {
  try {
    await libteam.destroy(entity, opts)
    if (opts.json) {
      console.log(JSON.stringify({
        deleted: true,
        team: entity
      }))
    } else if (opts.parseable) console.log(`${entity}\tdeleted`)
    else if (!opts.silent && opts.loglevel !== 'silent') console.log(`-@${entity}`)
  } catch (e) { logError(e) }
}

const teamAdd = async (entity, user, opts) => {
  try {
    await libteam.add(user, entity, opts)
    if (opts.json) {
      console.log(JSON.stringify({
        added: true,
        team: entity,
        user
      }))
    } else if (opts.parseable) console.log(`${user}\t${entity}\tadded`)
    else if (!opts.silent && opts.loglevel !== 'silent') console.log(`${user} added to @${entity}`)
  } catch (e) { logError(e) }
}

const teamRm = async (entity, user, opts) => {
  try {
    await libteam.rm(user, entity, opts)
    if (opts.json) {
      console.log(JSON.stringify({
        removed: true,
        team: entity,
        user
      }))
    } else if (opts.parseable) console.log(`${user}\t${entity}\tremoved`)
    else if (!opts.silent && opts.loglevel !== 'silent') console.log(`${user} removed from @${entity}`)
  } catch (e) { logError(e) }
}

const teamListUsers = async (entity, opts) => {
  try {
    let users = await libteam.lsUsers(entity, opts)
    users = users.sort()
    if (opts.json) {
      console.log(JSON.stringify(users, null, 2))
    } else if (opts.parseable) console.log(users.join('\n'))
    else if (!opts.silent && opts.loglevel !== 'silent') {
      console.log(`\n@${entity} has ${users.length} user${users.length === 1 ? '' : 's'}:\n`)
      logUsersAndTeams(users);
    }
  } catch (e) { logError(e) }
}

const teamListTeams = async (entity, opts) => {
  try {
    let teams = await libteam.lsTeams(entity, opts)
    teams = teams.sort()
    if (opts.json) {
      console.log(JSON.stringify(teams, null, 2))
    } else if (opts.parseable) console.log(teams.join('\n'))
    else if (!opts.silent && opts.loglevel !== 'silent') {
      console.log(`\n@${entity} has ${teams.length} team${teams.length === 1 ? '' : 's'}:\n`)
      logUsersAndTeams(teams.map(t => `@${t}`));
    }
  } catch (e) { logError(e) }
}
