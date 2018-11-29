// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict'

// NOTE: The code here is almost all identical to the regular module.js.
//       It's reloaded here because the `process.binding('fs')` override
//       can't retroactively affect module.js. All other functionality is
//       done by the fs override itself.
module.exports.overrideNode = overrideNode
function overrideNode () {
  const fs = require('fs')
  const Module = require('module')
  const path = require('path')
  const {
    internalModuleReadJSON,
    internalModuleStat
  } = process.binding('fs')
  const preserveSymlinks = !!process.binding('config').preserveSymlinks
  const preserveSymlinksMain = !!process.binding('config').preserveSymlinksMain

  const CHAR_FORWARD_SLASH = '/'.charCodeAt(0)

  stat.cache = new Map()
  function stat (filename) {
    filename = path.resolve(path.toNamespacedPath(filename))
    const cache = stat.cache
    if (cache !== null) {
      const result = cache.get(filename)
      if (result !== undefined) return result
    }
    let result
    result = internalModuleStat(filename)
    if (cache !== null) cache.set(filename, result)
    return result
  }

  function toRealPath (requestPath) {
    return fs.realpathSync(requestPath)
  }

  function tryExtensions (p, exts, isMain) {
    for (var i = 0; i < exts.length; i++) {
      const filename = tryFile(p + exts[i], isMain)

      if (filename) {
        return filename
      }
    }
    return false
  }

  function tryFile (requestPath, isMain) {
    const rc = stat(requestPath)
    if (preserveSymlinks && !isMain) {
      return rc === 0 && path.resolve(requestPath)
    }
    return rc === 0 && toRealPath(requestPath)
  }

  const packageMainCache = Object.create(null)

  function readPackage (requestPath) {
    const entry = packageMainCache[requestPath]
    if (entry) {
      return entry
    }

    const jsonPath = path.resolve(requestPath, 'package.json')
    const json = internalModuleReadJSON(path.toNamespacedPath(jsonPath))

    if (json === undefined) {
      return false
    }

    try {
      packageMainCache[requestPath] = JSON.parse(json).main
      return packageMainCache[requestPath]
    } catch (e) {
      e.path = jsonPath
      e.message = 'Error parsing ' + jsonPath + ': ' + e.message
      throw e
    }
  }

  function tryPackage (requestPath, exts, isMain) {
    const pkg = readPackage(requestPath)

    if (!pkg) return false

    const filename = path.resolve(requestPath, pkg)
    return tryFile(filename, isMain) ||
           tryExtensions(filename, exts, isMain) ||
           tryExtensions(path.resolve(filename, 'index'), exts, isMain)
  }

  let warned = false
  Module._findPath = function (request, paths, isMain) {
    if (path.isAbsolute(request)) {
      paths = ['']
    } else if (!paths || paths.length === 0) {
      return false
    }

    var cacheKey = request + '\x00' +
                  (paths.length === 1 ? paths[0] : paths.join('\x00'))
    var entry = Module._pathCache[cacheKey]
    if (entry) {
      return entry
    }

    var exts
    var trailingSlash = request.length > 0 &&
      request.charCodeAt(request.length - 1) === CHAR_FORWARD_SLASH
    if (!trailingSlash) {
      trailingSlash = /(?:^|\/)\.?\.$/.test(request)
    }

    // For each path
    for (var i = 0; i < paths.length; i++) {
      // Don't search further if path doesn't exist
      const curPath = paths[i]
      if (curPath && stat(curPath) < 0) continue
      var basePath = path.resolve(curPath, request)
      var filename

      var rc = stat(basePath)
      if (!trailingSlash) {
        if (rc === 0) { // File.
          if (!isMain) {
            if (preserveSymlinks) {
              filename = path.resolve(basePath)
            } else {
              filename = toRealPath(basePath)
            }
          } else if (preserveSymlinksMain) {
            // For the main module, we use the preserveSymlinksMain flag instead
            // mainly for backward compatibility, as the preserveSymlinks flag
            // historically has not applied to the main module.  Most likely this
            // was intended to keep .bin/ binaries working, as following those
            // symlinks is usually required for the imports in the corresponding
            // files to resolve; that said, in some use cases following symlinks
            // causes bigger problems which is why the preserveSymlinksMain option
            // is needed.
            filename = path.resolve(basePath)
          } else {
            filename = toRealPath(basePath)
          }
        }

        if (!filename) {
          // try it with each of the extensions
          if (exts === undefined) { exts = Object.keys(Module._extensions) }
          filename = tryExtensions(basePath, exts, isMain)
        }
      }

      if (!filename && rc === 1) { // Directory.
        // try it with each of the extensions at "index"
        if (exts === undefined) { exts = Object.keys(Module._extensions) }
        filename = tryPackage(basePath, exts, isMain)
        if (!filename) {
          filename = tryExtensions(path.resolve(basePath, 'index'), exts, isMain)
        }
      }

      if (filename) {
        // Warn once if '.' resolved outside the module dir
        if (request === '.' && i > 0) {
          if (!warned) {
            warned = true
            process.emitWarning(
              'warning: require(\'.\') resolved outside the package ' +
              'directory. This functionality is deprecated and will be removed ' +
              'soon.',
              'DeprecationWarning', 'DEP0019')
          }
        }

        Module._pathCache[cacheKey] = filename
        return filename
      }
    }
    return false
  }

  // let requireDepth = 0
  //
  // // Run the file contents in the correct scope or sandbox. Expose
  // // the correct helper variables (require, module, exports) to
  // // the file.
  // // Returns exception, if any.
  // let resolvedArgv
  // Module.prototype._compile = function (content, filename) {
  //   content = stripShebang(content)
  //
  //   // create wrapper function
  //   var wrapper = Module.wrap(content)
  //
  //   var compiledWrapper = vm.runInThisContext(wrapper, {
  //     filename: filename,
  //     lineOffset: 0,
  //     displayErrors: true
  //   })
  //
  //   var inspectorWrapper = null
  //   if (process._breakFirstLine && process._eval == null) {
  //     if (!resolvedArgv) {
  //       // we enter the repl if we're not given a filename argument.
  //       if (process.argv[1]) {
  //         resolvedArgv = Module._resolveFilename(process.argv[1], null, false)
  //       } else {
  //         resolvedArgv = 'repl'
  //       }
  //     }
  //
  //     // Set breakpoint on module start
  //     if (filename === resolvedArgv) {
  //       delete process._breakFirstLine
  //       inspectorWrapper = process.binding('inspector').callAndPauseOnStart
  //     }
  //   }
  //   var dirname = path.dirname(filename)
  //   var require = makeRequireFunction(this)
  //   var depth = requireDepth
  //   if (depth === 0) stat.cache = new Map()
  //   var result
  //   if (inspectorWrapper) {
  //     result = inspectorWrapper(
  //       compiledWrapper, this.exports, this.exports,
  //       require, this, filename, dirname, process,
  //       global, Buffer
  //     )
  //   } else {
  //     result = compiledWrapper.call(
  //       this.exports, this.exports, require, this,
  //       filename, dirname, process, global, Buffer
  //     )
  //   }
  //   if (depth === 0) stat.cache = null
  //   return result
  // }
  //
  // const CHAR_HASH = '#'.charCodeAt(0)
  // const CHAR_EXCLAMATION_MARK = '!'.charCodeAt(0)
  // const CHAR_LINE_FEED = '\n'.charCodeAt(0)
  // const CHAR_CARRIAGE_RETURN = '\r'.charCodeAt(0)
  // function stripShebang (content) {
  //   // Remove shebang
  //   var contLen = content.length
  //   if (contLen >= 2) {
  //     if (content.charCodeAt(0) === CHAR_HASH &&
  //     content.charCodeAt(1) === CHAR_EXCLAMATION_MARK) {
  //       if (contLen === 2) {
  //         // Exact match
  //         content = ''
  //       } else {
  //         // Find end of shebang line and slice it off
  //         var i = 2
  //         for (; i < contLen; ++i) {
  //           var code = content.charCodeAt(i)
  //           if (code === CHAR_LINE_FEED || code === CHAR_CARRIAGE_RETURN) {
  //             break
  //           }
  //         }
  //         if (i === contLen) {
  //           content = ''
  //         } else {
  //           // Note that this actually includes the newline character(s) in the
  //           // new output. This duplicates the behavior of the regular expression
  //           // that was previously used to replace the shebang line
  //           content = content.slice(i)
  //         }
  //       }
  //     }
  //   }
  //   return content
  // }
  //
  // // Invoke with makeRequireFunction(module) where |module| is the Module object
  // // to use as the context for the require() function.
  // function makeRequireFunction (mod) {
  //   const Module = mod.constructor
  //
  //   function require (path) {
  //     try {
  //       exports.requireDepth += 1
  //       return mod.require(path)
  //     } finally {
  //       exports.requireDepth -= 1
  //     }
  //   }
  //
  //   function resolve (request, options) {
  //     if (typeof request !== 'string') {
  //       throw new ERR_INVALID_ARG_TYPE('request', 'string', request)
  //     }
  //     return Module._resolveFilename(request, mod, false, options)
  //   }
  //
  //   require.resolve = resolve
  //
  //   function paths (request) {
  //     if (typeof request !== 'string') {
  //       throw new ERR_INVALID_ARG_TYPE('request', 'string', request)
  //     }
  //     return Module._resolveLookupPaths(request, mod, true)
  //   }
  //
  //   resolve.paths = paths
  //
  //   require.main = process.mainModule
  //
  //   // Enable support to add extra extension types.
  //   require.extensions = Module._extensions
  //
  //   require.cache = Module._cache
  //
  //   return require
  // }
  //
  // function ERR_INVALID_ARG_TYPE (name, expected, actual) {
  //   // determiner: 'must be' or 'must not be'
  //   let determiner
  //   if (typeof expected === 'string' && expected.startsWith('not ')) {
  //     determiner = 'must not be'
  //     expected = expected.replace(/^not /, '')
  //   } else {
  //     determiner = 'must be'
  //   }
  //
  //   let msg
  //   if (name.endsWith(' argument')) {
  //     // For cases like 'first argument'
  //     msg = `The ${name} ${determiner} ${oneOf(expected, 'type')}`
  //   } else {
  //     const type = name.includes('.') ? 'property' : 'argument'
  //     msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, 'type')}`
  //   }
  //
  //   msg += `. Received type ${typeof actual}`
  //   throw new TypeError(msg)
  // }
  //
  // function oneOf (expected, thing) {
  //   if (Array.isArray(expected)) {
  //     const len = expected.length
  //     expected = expected.map((i) => String(i))
  //     if (len > 2) {
  //       return `one of ${thing} ${expected.slice(0, len - 1).join(', ')}, or ` +
  //       expected[len - 1]
  //     } else if (len === 2) {
  //       return `one of ${thing} ${expected[0]} or ${expected[1]}`
  //     } else {
  //       return `of ${thing} ${expected[0]}`
  //     }
  //   } else {
  //     return `of ${thing} ${String(expected)}`
  //   }
  // }
}
