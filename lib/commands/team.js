/* eslint-disable standard/no-callback-literal */

const columns = require('cli-columns')
const figgyPudding = require('figgy-pudding')
const libteam = require('libnpmteam')
const npmConfig = require('../config.js')
const output = require('./utils/output.js')
const otplease = require('./utils/otplease.js')
const usage = require('./utils/usage')
const log = require('npmlog')

const Team = module.exports = {
  command: 'team',
  describe: 'Used to manage teams in organizations, and change team memberships. Does not handle permissions for packages.',
  aliases: ['t'],
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Team.options)
      .command({
        command: 'create',
        aliases: ['c'],
        describe: 'Create a new team',
        builder: (y) => y.help().alias('help', 'h').options({
          'scope': {
            alias: 's',
            describe: 'Scope name. For example: @npm',
            type: 'string',
            demandOption: true,
          },
          'name': {
            alias: 'n',
            describe: 'Name of the team. For example: cli',
            type: 'string',
            demandOption: true,
          },
        }),
        handler: ({ scope, name }) => team('create', `${scope}:${name[0]}`),
      })
      .command({
        command: 'destroy',
        aliases: ['d'],
        describe: 'Destroy an existing team',
        builder: (y) => y.help().alias('help', 'h'),
        handler: (argv) => console.log(`setting ${argv.key} to ${argv.value}`)
      })
      .command({
        command: 'add',
        aliases: ['a'],
        describe: 'Add a user to an existing team',
        builder: (y) => y.help().alias('help', 'h'),
        handler: (argv) => console.log(`setting ${argv.key} to ${argv.value}`)
      })
      .command({
        command: 'rm',
        aliases: ['r'],
        describe: 'Remove a user from a team they belong to',
        builder: (y) => y.help().alias('help', 'h'),
        handler: (argv) => console.log(`setting ${argv.key} to ${argv.value}`)
      })
      .command({
        command: 'ls',
        aliases: ['l'],
        describe: 'If performed on an organization name, will return a list of existing teams under that organization. If performed on a team, it will instead return a list of all users belonging to that particular team.',
        builder: (y) => y.help().alias('help', 'h').options({
          'name': {
            alias: 'n',
            describe: 'Name of the team. For example: cli',
            type: 'string',
            demandOption: true,
          },
        }),
        handler: ({ name }) => team('ls', name[0]),
      })
      .command({
        command: 'edit',
        aliases: ['e'],
        describe: 'Edit an existing team',
        builder: (y) => y.help().alias('help', 'h'),
        handler: (argv) => console.log(`setting ${argv.key} to ${argv.value}`)
      })
  },
  options: Object.assign(require('../common-opts.js', {})),
  handler: (argv) => {
    console.log(`settings`)
    console.log(argv)
  }
}

const TeamConfig = figgyPudding({
  json: {},
  loglevel: {},
  parseable: {},
  silent: {},
  token: {},
  registry: {},
})

const getOpts = (argv) => TeamConfig(npmConfig().concat(argv).concat({ log }));

function UsageError () {
  throw Object.assign(new Error(team.usage), { code: 'EUSAGE' })
}

function team (cmd, entity = '', user = '') {
  // Entities are in the format <scope>:<team>
  otplease(npmConfig(), opts => {
    opts = TeamConfig(opts)
    entity = entity.replace(/^@/, '')
    switch (cmd) {
      case 'create': return teamCreate(entity, opts)
      case 'destroy': return teamDestroy(entity, opts)
      case 'add': return teamAdd(entity, user, opts)
      case 'rm': return teamRm(entity, user, opts)
      case 'ls': {
        const match = entity.match(/[^:]+:.+/)
        if (match) {
          return teamListUsers(entity, opts)
        } else {
          return teamListTeams(entity, opts)
        }
      }
      case 'edit':
        throw new Error('`npm team edit` is not implemented yet.')
      default:
        UsageError()
    }
  }).then(
    data => console.log('Data ---->', data),
    err => console.log('Error ---->', err)
  ).catch((err) => console.log('Error ---->', err))
}

function teamCreate (entity, opts) {
  libteam.create(entity, opts).then(() => {
    if (opts.json) {
      output(JSON.stringify({
        created: true,
        team: entity
      }))
    } else if (opts.parseable) {
      output(`${entity}\tcreated`)
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      output(`+@${entity}`)
    }
  }).catch((err) => console.log('Error ---->', err))
}

function teamDestroy (entity, opts) {
  return libteam.destroy(entity, opts).then(() => {
    if (opts.json) {
      output(JSON.stringify({
        deleted: true,
        team: entity
      }))
    } else if (opts.parseable) {
      output(`${entity}\tdeleted`)
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      output(`-@${entity}`)
    }
  })
}

function teamAdd (entity, user, opts) {
  return libteam.add(user, entity, opts).then(() => {
    if (opts.json) {
      output(JSON.stringify({
        added: true,
        team: entity,
        user
      }))
    } else if (opts.parseable) {
      output(`${user}\t${entity}\tadded`)
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      output(`${user} added to @${entity}`)
    }
  })
}

function teamRm (entity, user, opts) {
  return libteam.rm(user, entity, opts).then(() => {
    if (opts.json) {
      output(JSON.stringify({
        removed: true,
        team: entity,
        user
      }))
    } else if (opts.parseable) {
      output(`${user}\t${entity}\tremoved`)
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      output(`${user} removed from @${entity}`)
    }
  })
}

function teamListUsers (entity, opts) {
  return libteam.lsUsers(entity, opts).then(users => {
    users = users.sort()
    if (opts.json) {
      output(JSON.stringify(users, null, 2))
    } else if (opts.parseable) {
      output(users.join('\n'))
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      output(`\n@${entity} has ${users.length} user${users.length === 1 ? '' : 's'}:\n`)
      output(columns(users, { padding: 1 }))
    }
  })
}

function teamListTeams (entity, opts) {
  return libteam.lsTeams(entity, opts).then(teams => {
    teams = teams.sort()
    if (opts.json) {
      output(JSON.stringify(teams, null, 2))
    } else if (opts.parseable) {
      output(teams.join('\n'))
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      output(`\n@${entity} has ${teams.length} team${teams.length === 1 ? '' : 's'}:\n`)
      output(columns(teams.map(t => `@${t}`), { padding: 1 }))
    }
  })
}
