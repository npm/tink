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
        command: 'list-tokens',
        aliases: ['lt'],
        describe: 'Fetch a list of all of the authentication tokens the authenticated user has.',
        builder: y => y.help('help', 'h').options({
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
        }),
        handler: argv => listTokens(getOptions(argv))
      })
  },
  options: Object.assign({}, require('../common-opts'), {})
};

const libnpm = require('libnpm')
const figgyPudding = require('figgy-pudding')
const { h, renderToString } = require('ink')
const Table = require('ink-table').default
const log = require('npmlog')
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

const getOptions = argv => ProfileConfig(npmConfig().concat(argv).concat({ log }))

// TODO: Move to `../utils`?
const logError = (err) => console.error(`Error code: ${err.code} => ${err.message}`);

async function listTokens (opts) {
  try {
    const tokens = await libnpm.profile.listTokens(opts)

    if (opts.json) {
      console.log(JSON.stringify(tokens, null, 2))
    } else if (opts.parseable) {
      const headers = ['token', 'key', 'cidr_whitelist', 'readonly', 'created', 'updated']
      console.log(headers.join('\t'))
      tokens.forEach(token => {
        let values = headers
          .map(header => token[header])
          .reduce((previous, current) => `${previous}\t${current}`)
        console.log(values)
      })
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      const data = tokens.map(token => {
        token.key = token.key.substring(0, 6);
        token.token = token.token.substring(0, 6) + '...'
        token.readonly = token.readonly ? 'yes' : 'no'
        return token
      });
      console.log(renderToString(<Table data={data}/>))
    }
  } catch (e) {
    logError(e)
  }
}
