'use strict'

const wrap = require('spawn-wrap')

module.exports.overrideNode = overrideNode
function overrideNode () {
  wrap([require.resolve('./wrap.js')])
}
