'use strict'

const npmConfig = require('../config.js')
const libnpm = require('libnpm')
const figgyPudding = require('figgy-pudding')
const log = require('npmlog')

module.exports = ping

function ping (argv) {
  const {json, registry, silent} = argv

  const PingConfig = figgyPudding({
    json: {
      default: json
    },
    registry: {
      default: registry
    }
  })

  const opts = PingConfig(npmConfig())
  log.notice('PING', registry)
  const start = Date.now()
  return libnpm.fetch('/-/ping?write=true', opts).then(res => {
    return res.json().catch(() => ({}))
  }).then(details => {
    if (silent) {
    } else {
      const time = Date.now() - start
      log.notice('PONG', `${time / 1000}ms`)
      if (json) {
        console.log(JSON.stringify({
          registry,
          time,
          details
        }, null, 2))
      } else if (Object.keys(details).length) {
        log.notice('PONG', `${JSON.stringify(details, null, 2)}`)
      }
    }
  })
}
