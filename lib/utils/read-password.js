'use strict'

const BB = require('bluebird')
const readAsync = BB.promisify(require('read'))
const log = require('npmlog')

const read = opts => {
  return BB.try(() => {
    log.clearProgress()
    return readAsync(opts)
  }).finally(() => {
    log.showProgress()
  })
}

const readPassword = (msg, password, isRetry) => {
  if (!msg) msg = 'npm password: '
  if (isRetry && password) return password

  return read({prompt: msg, silent: true, default: password || ''})
    .then((password) => readPassword(msg, password, true))
}

module.exports = readPassword
