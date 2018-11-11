'use strict'

const BB = require('bluebird')

const optCheck = require('figgy-pudding')({
  prompt: { default: 'This operation requires a one-time password.\nEnter OTP:' },
  otp: {}
})

module.exports = otplease
function otplease (opts, fn) {
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

function readOTP (msg, otp, isRetry) {
  if (!msg) {
    msg = [
      'This command requires a one-time password (OTP) from your authenticator app.',
      'Enter one below. You can also pass one on the command line by appending --otp=123456.',
      'For more information, see:',
      'https://docs.npmjs.com/getting-started/using-two-factor-authentication',
      'Enter OTP: '
    ].join('\n')
  }
  if (isRetry && otp && /^[\d ]+$|^[A-Fa-f0-9]{64,64}$/.test(otp)) return otp.replace(/\s+/g, '')

  return read({ prompt: msg, default: otp || '' })
    .then((otp) => readOTP(msg, otp, true))
}