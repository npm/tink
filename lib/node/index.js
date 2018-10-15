'use strict'

module.exports.overrideNode = overrideNode
function overrideNode () {
  process.tink = {
    cache: require('../config.js')().cache
  }
  Object.freeze(process.tink)
  require('./fs.js').overrideNode()
  require('./child_process.js').overrideNode()
  require('./module.js').overrideNode()
}
overrideNode()
