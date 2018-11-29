'use strict'

module.exports.overrideNode = overrideNode
function overrideNode () {
  require('./fs.js').overrideNode()
  require('./child_process.js').overrideNode()
  require('./module.js').overrideNode()
  require('./extensions.js').overrideNode()
}
overrideNode()
