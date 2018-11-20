'use strict'

const BB = require('bluebird')

const optCheck = require('figgy-pudding')({
  prompt: { default: 'This operation requires a one-time password.\nEnter OTP:' },
  otp: {}
})

module.exports = otplease
function otplease (opts, fn) {
  const readOTP = require('./read-otp')

  opts = opts.concat ? opts : optCheck(opts)
  return BB.try(() => {
    return fn(opts)
  }).catch(err => {
    if (err.code !== 'EOTP' && !(err.code === 'E401' && /one-time pass/.test(err.body))) {
      throw err
    } else if (!process.stdin.isTTY || !process.stdout.isTTY) {
      throw err
    } else {
      return readOTP(
        optCheck(opts).prompt
      ).then(otp => fn(opts.concat({ otp })))
    }
  })
}
