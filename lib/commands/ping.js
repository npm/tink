'use strict'

const fetch = require('libnpm/fetch')
const figgyPudding = require('figgy-pudding')
const url = require('url')

const PingConfig = figgyPudding({
  json: {},
  loglevel: {},
  registry: {}
})

module.exports = ping
async function ping (argv, opts) {
  opts = PingConfig(opts)
  let registry = argv[0] || opts.registry

  const parsed = url.parse(registry)
  if (!parsed.protocol) {
    registry = `https://${registry}`
  }

  if (opts.loglevel !== 'silent' && !opts.json) {
    console.log(`-> PING ${registry}`)
  }
  const start = Date.now()
  const details = await fetch.json('/-/ping', opts.concat({
    cache: false,
    query: { write: true },
    registry
  }))
  if (opts.loglevel === 'silent') {
  } else {
    const time = Date.now() - start
    if (opts.json) {
      console.log(JSON.stringify({
        registry,
        time,
        details
      }, null, 2))
    } else {
      console.log(`<- PONG (${time / 1000}ms)\n`)
      if (Object.keys(details).length) {
        console.log(JSON.stringify(details, null, 2))
      }
    }
  }
  return details
}
