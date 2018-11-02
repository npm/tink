'use strict'

const npmConfig = require('../config.js')
const libnpm = require('libnpm')
const figgyPudding = require('figgy-pudding')
const log = require('npmlog')

module.exports = ping

const PingConfig = figgyPudding({
  json: {},
  registry: {},
  silent: {}
})

function ping (argv) {
  const opts = PingConfig(npmConfig().concat(argv))

  log.notice('PING', opts.registry)
  const start = Date.now()
  return libnpm.fetch.json('/-/ping?write=true', opts).catch(() => ({})).then(details => {
    if (opts.silent) {
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
