'use strict'

const figgyPudding = require('figgy-pudding')
const libnpm = require('libnpm')
const { h, renderToString } = require('ink')
const Table = require('ink-table').default
const npmConfig = require('../config.js')

const Org = module.exports = {
  command: 'org',
  describe: 'org-related subcommands',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Org.options)
      .demandCommand(1, 'Org subcommand is required')
      .recommendCommands()
      .command(
        ['add <orgname> <username> [role]', 'set'],
        'Add someone to an org',
        Org.options,
        async argv => orgAdd(argv)
      )
      .command(
        'rm <org> <user>',
        'Remove someone from an org',
        Org.options,
        async argv => orgRm(argv)
      )
      .command(
        'ls <org>',
        'List org members',
        Org.options,
        async argv => orgLs(argv)
      )
  },
  options: Object.assign(require('../common-opts.js', {}))
}

async function orgAdd (argv) {
  const OrgConfig = figgyPudding({
    json: {},
    loglevel: {},
    parseable: {},
    silent: {}
  })

  const opts = OrgConfig(npmConfig().concat(argv).concat({
    log: require('npmlog')
  }))
  const memDeets = await libnpm.org.set(argv.org, argv.user, argv.role, opts)
  if (opts.json) {
    console.log(JSON.stringify(memDeets, null, 2))
  } else if (opts.parseable) {
    console.log(['org', 'orgsize', 'user', 'role'].join('\t'))
    console.log([
      memDeets.org.name,
      memDeets.org.size,
      memDeets.user,
      memDeets.role
    ])
  } else if (!opts.silent && opts.loglevel !== 'silent') {
    console.log(`Added ${memDeets.user} as ${memDeets.role} to ${memDeets.org.name}. You now ${memDeets.org.size} member${memDeets.org.size === 1 ? '' : 's'} in this org.`)
  }
  return memDeets
}

async function orgRm (argv) {
  const OrgConfig = figgyPudding({
    json: {},
    loglevel: {},
    parseable: {},
    silent: {}
  })

  const opts = OrgConfig(npmConfig().concat(argv).concat({
    log: require('npmlog')
  }))
  await libnpm.org.rm(argv.org, argv.user, opts)
  const roster = libnpm.org.ls(argv.org, opts)
  const user = argv.user.replace(/^[~@]?/, '')
  const org = argv.org.replace(/^[~@]?/, '')
  const userCount = Object.keys(roster).length
  if (opts.json) {
    console.log(JSON.stringify({
      user,
      org,
      userCount,
      deleted: true
    }))
  } else if (opts.parseable) {
    console.log(['user', 'org', 'userCount', 'deleted'].join('\t'))
    console.log([user, org, userCount, true].join('\t'))
  } else if (!opts.silent && opts.loglevel !== 'silent') {
    console.log(`Successfully removed ${user} from ${org}. You now have ${userCount} member${userCount === 1 ? '' : 's'} in this org.`)
  }
}

async function orgLs (argv) {
  const OrgConfig = figgyPudding({
    json: {},
    loglevel: {},
    parseable: {},
    silent: {}
  })

  const opts = OrgConfig(npmConfig().concat(argv).concat({
    log: require('npmlog')
  }))
  const roster = await libnpm.org.ls(argv.org, opts)
  if (opts.json) {
    console.log(JSON.stringify(roster, null, 2))
  } else if (opts.parseable) {
    console.log(['user', 'role'].join('\t'))
    Object.keys(roster).forEach(user => {
      console.log([user, roster[user]].join('\t'))
    })
  } else if (!opts.silent && opts.loglevel !== 'silent') {
    const data = Object.keys(roster).map(user => {
      return {user, role: roster[user]}
    })
    console.log(renderToString(<Table data={data}/>))
  }
}
