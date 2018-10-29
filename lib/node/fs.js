// NOTE: This is largely taken from Atom's `asar` patch here: https://raw.githubusercontent.com/electron/electron/master/lib/common/asar.js

const path = require('path')
const pkgmap = require('../pkgmap.js')
const util = require('util')

// Create a ENOENT error.
function notFoundError (filePath, callback) {
  const error = new Error(`ENOENT, ${filePath} not found`)
  error.code = 'ENOENT'
  error.errno = -2
  if (typeof callback !== 'function') {
    throw error
  }
  process.nextTick(() => callback(error))
}

// Create a ENOTDIR error.
function notDirError (callback) {
  const error = new Error('ENOTDIR, not a directory')
  error.code = 'ENOTDIR'
  error.errno = -20
  if (typeof callback !== 'function') {
    throw error
  }
  process.nextTick(() => callback(error))
}

// Create an EISDIR error.
function isDirError (filename, op, callback) {
  const error = new Error(`EISDIR: illegal operation on a directory, ${op}, ${filename}`)
  error.code = 'EISDIR'
  error.errno = -21
  if (typeof callback !== 'function') {
    throw error
  }
  process.nextTick(() => callback(error))
}

// Create an EACCES error.
function accessError (filePath, callback) {
  const error = new Error(`EACCES, permission denies, access '${filePath}'`)
  error.code = 'EACCES'
  error.errno = -13
  if (typeof callback !== 'function') {
    throw error
  }
  process.nextTick(() => callback(error))
}

// Override APIs that rely on passing file path instead of content to C++.
function overrideAPISync (module, name, arg) {
  if (arg == null) {
    arg = 0
  }
  const old = module[name]
  module[name] = function () {
    const p = arguments[arg]
    const resolved = pkgmap.resolve(p)
    if (resolved == null) { return old.apply(this, arguments) }
    if (resolved.isDir) {
      isDirError(p, name)
    }
    if (!resolved) {
      notFoundError(p)
    }

    const stat = pkgmap.statSync(resolved, true)
    if (!stat) {
      notFoundError(p)
    }

    arguments[arg] = stat.cachePath
    return old.apply(this, arguments)
  }
}

const overrideAPI = function (module, name, arg) {
  if (arg == null) {
    arg = 0
  }
  const old = module[name]
  module[name] = function () {
    const p = arguments[arg]

    const callback = arguments[arguments.length - 1]
    if (typeof callback !== 'function') {
      return overrideAPISync(module, name, arg)
    }

    const resolved = pkgmap.resolve(p)
    if (resolved == null) { return old.apply(this, arguments) }
    if (resolved.isDir) {
      isDirError(p, name, callback)
    }
    if (!resolved) {
      notFoundError(p, callback)
    }

    const stat = pkgmap.statSync(resolved, true)
    if (!stat) {
      notFoundError(p, callback)
    }

    arguments[arg] = stat.cachePath
    return old.apply(this, arguments)
  }
  if (old[util.promisify.custom]) {
    module[name][util.promisify.custom] = async function () {
      const p = arguments[arg]
      const resolved = pkgmap.resolve(p)
      if (resolved == null) {
        return old[util.promisify.custom].apply(this, arguments)
      }
      if (resolved.isDir) {
        isDirError(p, name)
      }
      if (!resolved) {
        notFoundError(p)
      }

      const stat = await pkgmap.stat(resolved, true)
      if (!stat) {
        notFoundError(p)
      }

      arguments[arg] = stat.cachePath
      return old[util.promisify.custom].apply(this, arguments)
    }
  }
}

// Override fs APIs.
module.exports.overrideNode = overrideNode
function overrideNode () {
  const fs = require('fs')

  const {lstatSync} = fs
  fs.lstatSync = function (p) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return lstatSync(p)
    } else if (!resolved) {
      return notFoundError(p)
    } else {
      const stats = pkgmap.statSync(resolved)
      if (!stats) {
        notFoundError(p)
      }
      return stats
    }
  }

  const {lstat} = fs
  fs.lstat = function (p, callback) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return lstat(p, callback)
    } else if (!resolved) {
      return notFoundError(p, callback)
    } else {
      pkgmap.stat(resolved).then(stat => {
        if (!stat) {
          return notFoundError(p, callback)
        }
        callback(null, stat)
      }, callback)
    }
  }

  const {statSync} = fs
  fs.statSync = function (p) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return statSync(p)
    } else if (!resolved) {
      return notFoundError(p)
    } else {
      const stats = pkgmap.statSync(resolved)
      if (!stats) {
        notFoundError(p)
      }
      return stats
    }
  }
  fs.statSync.orig = statSync

  const {stat} = fs
  fs.stat = function (p, callback) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return stat(p, callback)
    } else if (!resolved) {
      return notFoundError(p, callback)
    } else {
      pkgmap.stat(resolved).then(stat => {
        if (!stat) {
          notFoundError(p, callback)
        }
        callback(null, stat)
      }, callback)
    }
  }

  const {statSyncNoException} = fs
  fs.statSyncNoException = function (p) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return statSyncNoException(p)
    } else if (!resolved) {
      return false
    } else {
      const stats = pkgmap.statSync(resolved)
      if (!stats) {
        return false
      }
      return stats
    }
  }

  const {realpathSync} = fs
  fs.realpathSync = function (p) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return realpathSync.apply(this, arguments)
    } else if (!resolved) {
      return notFoundError(p)
    } else {
      return resolved.resolvedPath
    }
  }

  const {realpath} = fs
  fs.realpath = function (p, cache, callback) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return realpath.apply(this, arguments)
    }
    if (typeof cache === 'function') {
      callback = cache
      cache = void 0
    }

    process.nextTick(() => {
      if (resolved) {
        callback(null, resolved.resolvedPath)
      } else {
        notFoundError(p, callback)
      }
    })
  }

  const {exists} = fs // eslint-disable-line
  fs.exists = function (p, callback) { // eslint-disable-line
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      exists(p, callback)
    } else {
      process.nextTick(() => callback(null, !!resolved))
    }
  }

  fs.exists[util.promisify.custom] = async (p) => { // eslint-disable-line
    const resolved = pkgmap.resolve(p)
    if (resolved == null) { return exists[util.promisify.custom](p) }
    return !!resolved
  }

  const {existsSync} = fs
  fs.existsSync = function (p) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) { return existsSync(p) }
    return !!resolved
  }

  const {access} = fs
  fs.access = function (p, mode, callback) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return access(p, mode, callback)
    }
    if (typeof mode === 'function') {
      callback = mode
      mode = fs.constants.F_OK
    }
    if (!resolved) {
      return notFoundError(p, callback)
    } else if (resolved.isDir) {
      process.nextTick(() => {
        if (mode === fs.constants.F_OK || fs.constants.R_OK & mode) {
          callback(null)
        } else {
          accessError(p, callback)
        }
      })
    } else {
      pkgmap.stat(resolved).then(stat => {
        if (!stat) {
          return notFoundError(p, callback)
        }
        access(stat.cachePath, mode, callback)
      }, callback)
    }
  }

  const {accessSync} = fs
  fs.accessSync = function (p, mode) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return accessSync(p, mode)
    }
    if (mode == null) {
      mode = fs.constants.F_OK
    }
    if (!resolved) {
      return notFoundError(p)
    } else if (resolved.isDir) {
      if (mode === fs.constants.F_OK || fs.constants.R_OK & mode) {
        // undefined
      } else {
        return accessError(p)
      }
    } else {
      const stat = pkgmap.statSync(resolved)
      if (!stat) {
        notFoundError(p)
      }
      return fs.accessSync(stat.cachePath, mode)
    }
  }

  const {readFile} = fs
  fs.readFile = function (p, options, callback) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return readFile(p, options, callback)
    }
    if (typeof options === 'function') {
      callback = options
      options = {
        encoding: null
      }
    } else if (typeof options === 'string') {
      options = {
        encoding: options
      }
    } else if (options === null || options === undefined) {
      options = {
        encoding: null
      }
    } else if (typeof options !== 'object') {
      throw new TypeError('badarg')
    }
    if (resolved.isDir) {
      return isDirError(p, 'read', callback)
    } else if (!resolved) {
      return notFoundError(p, callback)
    }
    const {encoding} = options
    pkgmap.read(resolved).then(data => {
      if (encoding) {
        data = data.toString(encoding)
      }
      callback(null, data)
    }, callback)
  }

  const {readFileSync} = fs
  fs.readFileSync = function (p, options) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) { return readFileSync(p, options) }
    if (resolved.isDir) {
      isDirError(p, 'read')
    } else if (!resolved) {
      notFoundError(p)
    }
    if (!options) {
      options = {
        encoding: null
      }
    } else if (typeof options === 'string') {
      options = {
        encoding: options
      }
    } else if (typeof options !== 'object') {
      throw new TypeError('Bad arguments')
    }
    const {encoding} = options
    const data = pkgmap.readSync(resolved)
    if (encoding) {
      return data.toString(encoding)
    } else {
      return data
    }
  }

  const {readdir} = fs
  fs.readdir = function (p, callback) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return readdir(p, callback)
    } else if (!resolved) {
      notFoundError(p, callback)
    } else if (!resolved.isDir) {
      notDirError(callback)
    } else {
      process.nextTick(() => callback(null, Object.keys(resolved.dir)))
    }
  }

  const {readdirSync} = fs
  fs.readdirSync = function (p) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) {
      return readdirSync(p)
    } else if (!resolved) {
      notFoundError(p)
    } else if (!resolved.isDir) {
      notDirError()
    } else {
      return Object.keys(resolved.dir)
    }
  }

  const {internalModuleReadJSON} = process.binding('fs')
  process.binding('fs').internalModuleReadJSON = function (p) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) { return internalModuleReadJSON(p) }
    if (!resolved || resolved.isDir) { return }
    try {
      return pkgmap.readSync(resolved).toString('utf8')
    } catch (err) {
    }
  }

  const {internalModuleStat} = process.binding('fs')
  process.binding('fs').internalModuleStat = function (p) {
    const resolved = pkgmap.resolve(p)
    if (resolved == null) { return internalModuleStat(p) }
    if (resolved && resolved.isFile) { return 0 }
    if (resolved && resolved.isDir) { return 1 }
    if (!resolved && path.basename(p) === 'node_modules') { return 1 }
    return -34
  }

  // Calling mkdir for directory inside map archive should throw ENOTDIR
  // error, but on Windows it throws ENOENT.
  // This is to work around the recursive looping bug of mkdirp since it is
  // widely used.
  if (process.platform === 'win32') {
    const {mkdir} = fs
    fs.mkdir = function (p, mode, callback) {
      const resolved = pkgmap.resolve(p)
      if (resolved == null) { return mkdir(p, mode, callback) }
      if (typeof mode === 'function') {
        callback = mode
      }
      return notDirError(callback)
    }

    const {mkdirSync} = fs
    fs.mkdirSync = function (p, mode) {
      const resolved = pkgmap.resolve(p)
      if (resolved == null) { return mkdirSync(p, mode) }
      notDirError()
    }
  }

  overrideAPI(fs, 'open')
  overrideAPISync(process, 'dlopen', 1)
  overrideAPISync(require('module')._extensions, '.node', 1)
  overrideAPISync(fs, 'openSync')
}
