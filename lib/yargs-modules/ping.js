'use strict'

const mkCmd = require('../utils/cmd-handler.js')

const Ping = module.exports = {
  command: 'ping [registry]',
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
  handler: mkCmd((...args) => require('../commands/ping.js')(...args))
}
