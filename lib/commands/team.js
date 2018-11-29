/* eslint-disable standard/no-callback-literal */

const figgyPudding = require('figgy-pudding')
const libteam = require('libnpm/team')

const TeamConfig = figgyPudding({
  json: {},
  loglevel: {},
  parseable: {},
  silent: {},
  token: {},
  registry: {}
})

const logError = (err) => console.log(`Error code: ${err.code} => ${err.message}`)

const logUsersAndTeams = (arr) => arr.forEach((item) => console.log(item))

module.exports.create = teamCreate
async function teamCreate (entity, opts) {
  opts = TeamConfig(opts)
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

module.exports.destroy = teamDestroy
async function teamDestroy (entity, opts) {
  opts = TeamConfig(opts)
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

module.exports.add = teamAdd
async function teamAdd (entity, user, opts) {
  opts = TeamConfig(opts)
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

module.exports.rm = teamRm
async function teamRm (entity, user, opts) {
  opts = TeamConfig(opts)
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

module.exports.ls = teamLs
async function teamLs (entity, opts) {
  if (entity.match(/[^:]+:.+/)) {
    return teamLsUsers(entity, opts)
  } else {
    return teamLsTeams(entity, opts)
  }
}

async function teamLsUsers (entity, opts) {
  opts = TeamConfig(opts)
  try {
    let users = await libteam.lsUsers(entity, opts)
    users = users.sort()
    if (opts.json) {
      console.log(JSON.stringify(users, null, 2))
    } else if (opts.parseable) console.log(users.join('\n'))
    else if (!opts.silent && opts.loglevel !== 'silent') {
      console.log(`\n@${entity} has ${users.length} user${users.length === 1 ? '' : 's'}:\n`)
      logUsersAndTeams(users)
    }
  } catch (e) { logError(e) }
}

async function teamLsTeams (entity, opts) {
  opts = TeamConfig(opts)
  try {
    let teams = await libteam.lsTeams(entity, opts)
    teams = teams.sort()
    if (opts.json) {
      console.log(JSON.stringify(teams, null, 2))
    } else if (opts.parseable) console.log(teams.join('\n'))
    else if (!opts.silent && opts.loglevel !== 'silent') {
      console.log(`\n@${entity} has ${teams.length} team${teams.length === 1 ? '' : 's'}:\n`)
      logUsersAndTeams(teams.map(t => `@${t}`))
    }
  } catch (e) { logError(e) }
}
