'use strict'

const config = require('libnpm/config')

const CONFIG_NAMES = ['tinkrc', '.tinkrc', 'npmrc', '.npmrc']
const ENV_PREFIX = /^(?:npm|tink)_config_/i
module.exports = getConfigs
function getConfigs (argv) {
  return config.read({
    configNames: CONFIG_NAMES,
    envPrefix: ENV_PREFIX
  })
}
