'use strict'

module.exports.overrideNode = overrideNode

function overrideNode () {
  const fs = require('fs')
  const Module = require('module')

  let babel

  Module._extensions['.jsx'] = (module, filename) => {
    const content = fs.readFileSync(filename, 'utf8')
    if (!babel) { babel = require('babel-core') }
    const { code } = babel.transform(content, {
      plugins: [['transform-react-jsx', {
        pragma: 'h',
        useBuiltIns: true
      }]]
    })
    module._compile(code, filename)
  }

  Module._extensions['.ts'] = (module, filename) => {
    const content = fs.readFileSync(filename, 'utf8')
    if (!babel) { babel = require('typescript') }
    const { transformed } = babel.transform(content, {
      plugins: ['transform-typescript']
    })
    module._compile(transformed[0], filename)
  }
  Module._extensions['.tsx'] = Module._extensions['.ts']
}
