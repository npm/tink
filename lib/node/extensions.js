'use strict'

module.exports.overrideNode = overrideNode

function overrideNode () {
  const fs = require('fs')
  const Module = require('module')

  let jsx
  Module._extensions['.jsx'] = (module, filename) => {
    const content = fs.readFileSync(filename, 'utf8')
    if (!jsx) { jsx = require('jsx-transform') }
    const transformed = jsx.fromString(content, {
      factory: 'h',
      passUnknownTagsToFactory: true
    })
    module._compile(transformed, filename)
  }

  let ts
  Module._extensions['.ts'] = (module, filename) => {
    const content = fs.readFileSync(filename, 'utf8')
    if (!ts) { ts = require('typescript') }
    const { outputText } = ts.transpileModule(content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS
      },
      fileName: filename
    })
    module._compile(outputText, filename)
  }
  Module._extensions['.tsx'] = Module._extensions['.ts']
}
