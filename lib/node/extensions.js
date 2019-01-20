'use strict'

module.exports.overrideNode = overrideNode

function overrideNode () {
  // TODO: Decide which mode to use based on... something? Maybe a combination
  // of environment variables and command line flags? If you use transpile-only
  // it will completely skip all type checking and run no matter what.
  //
  // require('ts-node/register/transpile-only')
  require('ts-node/register/type-check')

  const fs = require('fs')
  const Module = require('module')

  let babel

  let reactPlugin
  Module._extensions['.jsx'] = (module, filename) => {
    const content = fs.readFileSync(filename, 'utf8')
    if (!babel) { babel = require('babel-core') }
    if (!reactPlugin) {
      reactPlugin = require('babel-plugin-transform-react-jsx')
    }
    const { code } = babel.transform(content, {
      plugins: [[reactPlugin, {
        pragma: 'h',
        useBuiltIns: true
      }]]
    })
    module._compile(code, filename)
  }
}
