'use strict'

const figgyPudding = require('figgy-pudding')
const { h, renderToString } = require('ink') // eslint-disable-line
const orgs = require('libnpm/org')
const Table = require('ink-table').default

const OrgConfig = figgyPudding({
  json: {},
  loglevel: {},
  org: {},
  parseable: {},
  role: {},
  silent: {},
  user: {}
})

module.exports.add = orgAdd
async function orgAdd (argv, opts) {
  opts = OrgConfig(opts)
  const memDeets = await orgs.set(opts.org, opts.user, opts.role, opts)
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

module.exports.rm = orgRm
async function orgRm (argv, opts) {
  opts = OrgConfig(opts)

  await orgs.rm(opts.org, opts.user, opts)
  const roster = orgs.ls(opts.org, opts)
  const user = opts.user.replace(/^[~@]?/, '')
  const org = opts.org.replace(/^[~@]?/, '')
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

module.exports.ls = orgLs
async function orgLs (argv, opts) {
  opts = OrgConfig(opts)
  const roster = await orgs.ls(opts.org, opts)
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
    console.log(renderToString(<Table data={data} />))
  }
}
