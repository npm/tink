'use strict'

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
        command: 'create-token',
        describe: 'Create a new authentication token, possibly with restrictions.',
        builder: y => y.help('help', 'h').options(Object.assign({}, ProfileSubcommandsOptions , {
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
        handler: argv => createToken(argv)
      })
      .command({
        command: 'list-tokens',
        aliases: ['lt'],
        describe: 'Fetch a list of all of the authentication tokens the authenticated user has.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: argv => listTokens(getOptions(argv))
      })
  },
  options: Object.assign({}, require('../common-opts'), {})
}

const libnpm = require('libnpm')
const figgyPudding = require('figgy-pudding')
const { h, renderToString } = require('ink')
const Table = require('ink-table').default
const log = require('npmlog')
const readPassword = require("../utils/read-password");
const npmConfig = require('../config.js')

const ProfileConfig = figgyPudding({
  json: {},
  parseable: {},
  silent: {},
  loglevel: {},
  token: {},
  username: {},
  password: {}
})

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

const tableHeaders = ['token', 'key', 'cidr_whitelist', 'readonly', 'created', 'updated']

const getOptions = argv => ProfileConfig(npmConfig().concat(argv).concat({ log }))

// TODO: Move to `../utils`?
const logError = (err) => console.error(`Error code: ${err.code} => ${err.message}`)

const mapTokenToTable = (token, options = { trimToken: true }) => {
  token.key = token.key.substring(0, 6)
  token.token = options.trimToken ? token.token.substring(0, 6) + '...' : token.token
  token.readonly = token.readonly ? 'yes' : 'no'
  return token
}

// TODO: OTP code
async function createToken(argv) {
  const opts = getOptions(argv)

  try {
    const password = await readPassword()
    const newToken = await libnpm.profile.createToken(
      password,
      argv['read-only'],
      argv.cidr_whitelist,
      opts
    )

    if (opts.json) {
      console.log(JSON.stringify(newToken, null, 2))
    } else if (opts.parseable) {
      console.log(tableHeaders.join('\t'))
      let values = tableHeaders
        .map(header => newToken[header])
        .reduce((previous, current) => `${previous}\t${current}`)
      console.log(values)
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      const data = [mapTokenToTable(newToken, { trimToken: false })]
      console.log(renderToString(<Table data={data}/>))
    }
  } catch (e) {
    logError(e)
  }
}

async function listTokens (opts) {
  try {
    const tokens = await libnpm.profile.listTokens(opts)

    if (opts.json) {
      console.log(JSON.stringify(tokens, null, 2))
    } else if (opts.parseable) {
      console.log(tableHeaders.join('\t'))
      tokens.forEach(token => {
        let values = tableHeaders
          .map(header => token[header])
          .reduce((previous, current) => `${previous}\t${current}`)
        console.log(values)
      })
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      const data = tokens.map(token => mapTokenToTable(token))
      console.log(renderToString(<Table data={data}/>))
    }
  } catch (e) {
    logError(e)
  }
}
