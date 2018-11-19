'use strict'

const npmConfig = require('../config')
const npm = require('libnpm')
const figgyPudding = require('figgy-pudding')
const { fetch } = npm

const WhoamiConfig = figgyPudding({
  json: {},
  registry: {}
})

const WhoAmI = (module.exports = {
  command: 'whoami [--registry <registry>]',
  aliases: ['wh'],
  describe: 'Prints username according to given registry',
  builder (yargs) {
    return yargs
      .help()
      .alias('help', 'h')
      .options(WhoAmI.options)
  },
  options: Object.assign(require('../common-opts'), {}),
  handler: whoami
})

async function whoami (argv) {
  const opts = WhoamiConfig(npmConfig().concat(argv))
  const { json, silent, registry, spec } = opts

  return new Promise(async (resolve, reject) => {
    if (!registry) {
      reject(new Error('no default registry set'))
    }

    let { username, token } = await npm.config.getCredentialsByURI(registry)
    if (username) {
      resolve(username)
    } else if (token) {
      username = await fetch.json('/-/whoami', opts.concat({ spec }))

      if (username) {
        resolve(username)
      } else if (token) {
        reject(
          new Error('Your auth token is no longer valid. Please log in again.')
        )
      } else {
        reject(new Error('This command requires you to be logged in.'))
      }
    }
  }).then(username => {
    if (silent) {
    } else if (json) {
      console.log(JSON.stringify(username))
    } else {
      console.log(username)
    }
    return username
  })
}
