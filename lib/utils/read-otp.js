'use strict'

const BB = require('bluebird')

function readOTP (msg, otp, isRetry) {
  const read = BB.promisify(require('read'))
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

module.exports = readOTP
