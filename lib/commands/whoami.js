'use strict'

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
  handler: argv => whoami(argv)
})

async function whoami (argv) {
  const npmConfig = require('../config')
  const figgyPudding = require('figgy-pudding')
  const fetch = require('libnpm/fetch')
  const log = require('libnpm/log')

  const WhoamiConfig = figgyPudding({
    json: {},
    registry: {},
    silent: {},
    spec: {}
  })

  const opts = WhoamiConfig(npmConfig().concat(argv).concat({ log }))
  const { json, silent } = opts

  let res
  try {
    res = await fetch.json('/-/whoami', opts)
  } catch (err) {
    console.error('You are not logged in. Please log in and try again.')
    process.exitCode = 1
    return
  }
  const { username } = res
  if (silent) {
  } else if (json) {
    console.log(JSON.stringify(username))
  } else {
    console.log(username)
  }
  return username
}
