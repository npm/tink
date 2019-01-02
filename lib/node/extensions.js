'use strict'

module.exports.overrideNode = overrideNode

function overrideNode () {
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

  let tsPlugin
  Module._extensions['.ts'] = (module, filename) => {
    const content = fs.readFileSync(filename, 'utf8')
    if (!babel) { babel = require('babel-core') }
    if (!tsPlugin) { tsPlugin = require('babel-plugin-transform-typescript') }
    const { code } = babel.transform(content, {
      plugins: [tsPlugin]
    })
    module._compile(code, filename)
  }
  Module._extensions['.tsx'] = Module._extensions['.ts']
}
