'use strict'

const QRCodeTerminal = require('qrcode-terminal')

const generateQRCode = url => {
  return new Promise((resolve) => QRCodeTerminal.generate(url, resolve))
}

module.exports = generateQRCode
