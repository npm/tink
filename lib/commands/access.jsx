'use strict'

const figgyPudding = require('figgy-pudding')
const libnpm = require('libnpm')

const ConfigOpts = figgyPudding({
  entity: {},
  json: {},
  loglevel: {},
  parseable: {},
  permissions: {},
  silent: {},
  spec: {},
  team: {},
  user: {}
})

const render = (opts, content = {}) => {
  const { h, renderToString } = require('ink') // eslint-disable-line
  const Table = require('ink-table').default

  if (opts.json) {
    console.log(JSON.stringify(content, null, 2))
  } else if (opts.parseable) {
    console.log(['collaborator', 'access'].join('\t'))
    Object.keys(content).forEach(collab => {
      console.log([collab, content[collab]].join('\t'))
    })
  } else if (!opts.silent && opts.loglevel !== 'silent') {
    const data = Object.keys(content).map(collab => {
      return { collab, role: content[collab] }
    })
    console.log(renderToString(<Table data={data} />))
  }
}

module.exports.public = accessPublic
async function accessPublic (argv, opts) {
  opts = ConfigOpts(opts)
  await libnpm.access.public(opts.spec, opts)
}

module.exports.restricted = accessRestricted
async function accessRestricted (argv, opts) {
  opts = ConfigOpts(opts)
  await libnpm.access.restricted(opts.spec, opts)
}

module.exports.grant = accessGrant
async function accessGrant (argv, opts) {
  opts = ConfigOpts(opts)
  await access.grant(opts.spec, opts.team, opts.permissions, opts) // eslint-disable-line
}

module.exports.revoke = accessRevoke
async function accessRevoke (argv, opts) {
  opts = ConfigOpts(opts)
  await libnpm.access.revoke(opts.spec, opts.team, opts)
}

module.exports.lsPackages = accessLsPackages
async function accessLsPackages (argv, opts) {
  opts = ConfigOpts(opts)
  const getPackagesByCurrentUser = async () => {
    const whoami = require('./whoami.js')
    return whoami([], opts.concat({ silent: true }))
  }

  const entity = opts.entity
    ? opts.entity
    : await getPackagesByCurrentUser()

  const packages =
    await libnpm.access.lsPackages(entity, opts)
  render(opts, packages)
}

module.exports.lsCollaborators = accessLsCollaborators
async function accessLsCollaborators (argv, opts) {
  opts = ConfigOpts(opts)

  if (opts.spec) {
    const collaborators =
      await libnpm.access.lsCollaborators(opts.spec, opts.user, opts)
    render(opts, collaborators)
  } else {
    const prefix = await libnpm.getPrefix(process.cwd())
    if (prefix) {
      const data = await libnpm.readJSON(
        `${prefix}/package.json`,
        console.error,
        false
      )

      if (data) {
        const collaborators =
          await libnpm.access.lsCollaborators(data.name, opts.user, opts)
        render(opts, collaborators)
      }
    }
  }
}

module.exports.edit = accessEdit
async function accessEdit (argv, opts) {
  // TODO: stub
}
