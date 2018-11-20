'use strict'

const Ping = module.exports = {
  command: 'ping',
  describe: 'ping registry',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Ping.options)
  },
  options: Object.assign(require('../common-opts.js', {
    json: {},
    log: {},
    silent: {}
  })),
  handler: async argv => ping(argv)
}

async function ping (argv) {
  const npmConfig = require('../config.js')
  const fetch = require('libnpm/fetch')
  const figgyPudding = require('figgy-pudding')
  const log = require('npmlog')

  const PingConfig = figgyPudding(Ping.options)

  const opts = PingConfig(npmConfig()).concat(argv).concat({ log })

  if (opts.loglevel !== 'silent' && !opts.json) {
    process.stdout.write(`PING ${opts.registry}`)
  }
  const start = Date.now()
  const details = await fetch.json('/-/ping', opts.concat({
    query: { write: true }
  }))
  if (opts.loglevel === 'silent') {
  } else {
    const time = Date.now() - start
    if (opts.json) {
      console.log(JSON.stringify({
        registry: opts.registry,
        time,
        details
      }, null, 2))
    } else {
      process.stdout.write(` => PONG ${time / 1000}ms\n`)
      if (Object.keys(details).length) {
        console.log(JSON.stringify(details, null, 2))
      }
    }
  }
  return details
}
