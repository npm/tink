'use strict'

module.exports = {
  command: 'ping',
  describe: 'ping registry',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Object.assign(require('../common-opts.js'), module.exports.options()))
  },
  options () { return {} },
  // lazy-load subcommands
  handler: ping
}

function ping (argv) {
  const npmConfig = require('../config.js')
  const libnpm = require('libnpm')
  const figgyPudding = require('figgy-pudding')
  const log = require('npmlog')

  const PingConfig = figgyPudding({
    json: {},
    registry: {},
    silent: {}
  })

  const opts = PingConfig(npmConfig().concat(argv))

  log.notice('PING', opts.registry)
  const start = Date.now()
  return libnpm.fetch.json('/-/ping?write=true', opts).catch(() => ({})).then(details => {
    if (opts.loglevel === 'silent') {
    } else {
      const time = Date.now() - start
      log.notice('PONG', `${time / 1000}ms`)
      if (opts.json) {
        console.log(JSON.stringify({
          registry: opts.registry,
          time,
          details
        }, null, 2))
      } else if (Object.keys(details).length) {
        log.notice('PONG', `${JSON.stringify(details, null, 2)}`)
      }
    }
  })
}
