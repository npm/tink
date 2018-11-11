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
        'ls-packages <entity>',
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
        'Set the access privileges for a package at once using $EDITOR',
        Access.options,
        async argv => accessEdit(argv)
      )
  },
  options: Object.assign(require('../common-opts.js', {}))
}

const figgyPudding = require('figgy-pudding')
const npmConfig = require('../config.js')
const libnpm = require('libnpm')

const Config = figgyPudding({
  json: {},
  loglevel: {},
  parseable: {},
  silent: {}
})

const parseOpts = argv => Config(npmConfig().concat(argv).concat({
  log: require('npmlog')
}))

const render = (opts, content) => {
  const { h, renderToString } = require('ink')
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
    console.log(renderToString(<Table data={data}/>))
  }
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
  const opts = parseOpts(argv)
  const getPackagesByCurrentUser = () => {
    // TODO: grab current authenticated user
    // TODO: seems to need whoami support
    return null
  }

  const entity = argv.entity
    ? argv.entity
    : getPackagesByCurrentUser()

    const packages = await libnpm.access.lsPackages(entity)
    render(opts, packages)
}

async function accessLsCollaborators (argv) {
  const npa = require("npm-package-arg")
  const findPrefix = require('find-npm-prefix')
  const readJson = require('read-package-json')
  const opts = parseOpts(argv)

  if (argv.package) {
    try {
      const packageName = npa(argv.package)
      const collaborators =
        await libnpm.access.lsCollaborators(packageName, argv.user, opts)
      render(opts, collaborators)
    } catch (err) {
      console.error(err)
    }
  } else {
    findPrefix(process.cwd())
      .then(prefix => {
        readJson(
          `${prefix}/package.json`,
          console.error,
          false,
          async (er, data) => {
            if (er) {
              console.error('There was an error reading the file')
            }
            const collaborators =
              await libnpm.access.lsCollaborators(data.name, argv.user, opts)
            render(opts, collaborators)
          }
        )
      })
  }
}

async function accessEdit (argv) {
  // TODO: stub
}
