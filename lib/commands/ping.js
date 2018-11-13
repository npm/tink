'use strict'

const Ping = module.exports = {
  command: 'ping',
  describe: 'ping registry',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Ping.options)
  },
  options: Object.assign(require('../common-opts.js', {})),
  handler: async argv => ping(argv)
}

async function ping (argv) {
  const npmConfig = require('../config.js')
  const libnpm = require('libnpm')
  const figgyPudding = require('figgy-pudding')
  const log = require('npmlog')

  const PingConfig = figgyPudding({
    json: {},
    log: { default: () => log },
    loglevel: { default: 'notice' },
    registry: {},
    silent: {}
  })

  const opts = PingConfig(npmConfig(argv)).concat({ log })

  if (opts.loglevel !== 'silent' && !opts.json) {
    process.stdout.write(`PING ${opts.registry}`)
  }
  const start = Date.now()
  let details
  try {
    details = await libnpm.fetch.json('/-/ping', opts.concat({
      query: { write: true }
    }))
  } catch (err) {
    details = {}
  }
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
