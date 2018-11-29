'use strict'

const figgyPudding = require('figgy-pudding')
const fetch = require('libnpm/fetch')

const WhoamiConfig = figgyPudding({
  json: {},
  registry: {},
  silent: {},
  spec: {}
})

module.exports = whoami
async function whoami (argv, opts) {
  opts = WhoamiConfig(opts)
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
