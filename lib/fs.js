// NOTE: This is largely taken from Atom's `asar` patch here: https://raw.githubusercontent.com/electron/electron/master/lib/common/asar.js

const childProcess = require('child_process')
const pkgmap = require('./pkgmap.js')
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

// Override APIs that rely on passing file path instead of content to C++.
function overrideAPISync (module, name, arg) {
  if (arg == null) {
    arg = 0
  }
  const old = module[name]
  module[name] = function () {
    const p = arguments[arg]
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return old.apply(this, arguments) }

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
    if (!resolved) { return old.apply(this, arguments) }

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
      if (!resolved) {
        return old[util.promisify.custom].apply(this, arguments)
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
function overrideNode (fs) {
  const {lstatSync} = fs
  fs.lstatSync = function (p) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return lstatSync(p) }
    const stats = pkgmap.statSync(resolved)
    if (!stats) {
      notFoundError(p)
    }
    return stats
  }

  const {lstat} = fs
  fs.lstat = function (p, callback) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return lstat(p, callback) }
    pkgmap.stat(resolved).then(stat => {
      if (!stat) {
        notFoundError(p, callback)
      }
      callback(null, stat)
    }, callback)
  }

  const {statSync} = fs
  fs.statSync = function (p) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return statSync(p) }
    return fs.lstatSync(p)
  }

  const {stat} = fs
  fs.stat = function (p, callback) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return stat(p, callback) }
    return fs.lstat(p, callback)
  }

  const {statSyncNoException} = fs
  fs.statSyncNoException = function (p) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return statSyncNoException(p) }
    const stats = pkgmap.statSync(resolved)
    if (!stats) {
      return false
    }
    return stats
  }

  const {realpathSync} = fs
  fs.realpathSync = function (p) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return realpathSync.apply(this, arguments) }
    const stat = fs.lstatSync(p)
    return fs.realpathSync(stat.cachePath)
  }

  const {realpath} = fs
  fs.realpath = function (p, cache, callback) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return realpath.apply(this, arguments) }
    if (typeof cache === 'function') {
      callback = cache
      cache = void 0
    }

    pkgmap.stat(resolved).then(stat => {
      if (!stat) {
        notFoundError(p, callback)
      }
    }, callback)
    fs.realpath(stat.cachePath, callback)
  }

  const {exists} = fs
  fs.exists = function (p, callback) {
    const resolved = pkgmap.resolve(p)
    // pkgmap.resolve distinguishes returns null if no valid pkgmap was found,
    // and false if a map was found, but the file was not in it.
    if (resolved == null) { return exists(p, callback) }
    if (!resolved) { return process.nextTick(() => callback(null, false)) }
    pkgmap.stat(resolved).then(stat => {
      callback(null, !!stat)
    }, callback)
  }

  fs.exists[util.promisify.custom] = async function (p) {
    const resolved = pkgmap.resolve(p)
    // pkgmap.resolve distinguishes returns null if no valid pkgmap was found,
    // and false if a map was found, but the file was not in it.
    if (resolved == null) { return exists[util.promisify.custom](p) }
    return resolved && !!await pkgmap.stat(resolved)
  }

  const {existsSync} = fs
  fs.existsSync = function (p) {
    const resolved = pkgmap.resolve(p)
    // pkgmap.resolve distinguishes returns null if no valid pkgmap was found,
    // and false if a map was found, but the file was not in it.
    if (resolved == null) { return existsSync(p) }
    return resolved && !!pkgmap.statSync(resolved)
  }

  const {access} = fs
  fs.access = function (p, mode, callback) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return access(p, mode, callback) }
    if (typeof mode === 'function') {
      callback = mode
      mode = fs.constants.F_OK
    }
    pkgmap.stat(resolved).then(stat => {
      if (!stat) {
        notFoundError(p, callback)
      }
      access(stat.cachePath, mode, callback)
    }, callback)
  }

  const {accessSync} = fs
  fs.accessSync = function (p, mode) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return accessSync(p, mode) }
    if (mode == null) {
      mode = fs.constants.F_OK
    }
    const stat = pkgmap.statSync(resolved)
    if (!stat) {
      notFoundError(p)
    }
    return fs.accessSync(stat.cachePath, mode)
  }

  const {readFile} = fs
  fs.readFile = function (p, options, callback) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return readFile(p, options, callback) }
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
    if (!resolved) {
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
    if (!resolved) { return readdir(p, callback) }
    process.nextTick(function () {
      callback(new Error('not implemented yet'))
    })
  }

  const {readdirSync} = fs
  fs.readdirSync = function (p) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return readdirSync(p) }
    throw new Error('not implemented yet')
  }

  const {internalModuleReadJSON} = process.binding('fs')
  process.binding('fs').internalModuleReadJSON = function (p) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return internalModuleReadJSON(p) }
    try {
      return pkgmap.readSync(resolved).toString('utf8')
    } catch (err) {
    }
  }

  const {internalModuleStat} = process.binding('fs')
  process.binding('fs').internalModuleStat = function (p) {
    const resolved = pkgmap.resolve(p)
    if (!resolved) { return internalModuleStat(p) }
    // ENOENT: 34
    // isDirectory: 1
    // isFile: 0
    return -34 // not implemented yet
  }

  // Calling mkdir for directory inside asar archive should throw ENOTDIR
  // error, but on Windows it throws ENOENT.
  // This is to work around the recursive looping bug of mkdirp since it is
  // widely used.
  if (process.platform === 'win32') {
    const {mkdir} = fs
    fs.mkdir = function (p, mode, callback) {
      const resolved = pkgmap.resolve(p)
      if (!resolved) { return mkdir(p, mode, callback) }
      if (typeof mode === 'function') {
        callback = mode
      }
      return notDirError(callback)
    }

    const {mkdirSync} = fs
    fs.mkdirSync = function (p, mode) {
      const resolved = pkgmap.resolve(p)
      if (!resolved) { return mkdirSync(p, mode) }
      notDirError()
    }
  }

  // TODO: use spawn-wrap to cover childProcess bits?
  // const {exec, execSync} = childProcess
  // childProcess.exec = invokeWithNoAsar(exec)
  // childProcess.exec[util.promisify.custom] = invokeWithNoAsar(exec[util.promisify.custom])
  // childProcess.execSync = invokeWithNoAsar(execSync)
  //
  // function invokeWithNo (func) {
  //   return function () {
  //     const processNoAsarOriginalValue = process.noAsar
  //     process.noAsar = true
  //     try {
  //       return func.apply(this, arguments)
  //     } finally {
  //       process.noAsar = processNoAsarOriginalValue
  //     }
  //   }
  // }

  overrideAPI(fs, 'open')
  // overrideAPI(childProcess, 'execFile')
  overrideAPISync(process, 'dlopen', 1)
  overrideAPISync(require('module')._extensions, '.node', 1)
  overrideAPISync(fs, 'openSync')
  overrideAPISync(childProcess, 'execFileSync')
}
