'use strict'

const { get: ccGet } = require('cacache')
const ccPath = require('cacache/lib/content/path.js')
const cp = require('child_process')
const fs = require('fs')
const npa = require('npm-package-arg')
const path = require('path')
const ssri = require('ssri')

// warm up npa
npa('idk')

const INDEX_VERSION = module.exports.INDEX_VERSION = '2.0.0'

const pkgLockName = 'package-lock.json'
const pkgLockCache = new Map()

const envNoPkgLock = process.env.FROG_NO_PKG_LOCK
const isPkgLockDisabled = () => !process.tink || process.tink.noPkgLock || envNoPkgLock

module.exports.resolve = resolve
module.exports._clearCache = () => pkgLockCache.clear()

function resolve (...p) {
  // Resolves a given path pointing _inside_ a `.package-map.json` into an
  // expected package + file hash.
  if (isPkgLockDisabled()) { return null }
  const resolved = path.resolve(...p)
  const result = readPkgLock(resolved)
  if (!result) { return result }
  let { pkgLock, subPath } = result
  if (!pkgLock) { return false }
  let pkgName, filePath
  let scope = pkgLock
  while (subPath) {
    if (subPath.startsWith('/node_modules')) {
      subPath = subPath.substr('/node_modules'.length)
      if (!subPath) { return false }
    }
    ;[, pkgName, subPath, filePath] = subPath.match(/^[/\\]((?:@[^/\\]+[/\\])?[^/\\]+)([/\\]?(.*))/)
    let res = resolveEntity(process.tink.cache, scope, pkgName, filePath)
    if (res && res.isFile) {
      // If the file already exists in the filesystem, use the filesystem
      // version.
      try {
        (fs.statSync.orig || fs.statSync)(resolved, true)
        return null
      } catch (e) {}
    }
    if (res) {
      const pkg = scope.dependencies[pkgName]
      pkg.name = pkgName
      return {
        cache: process.tink.cache,
        pkg,
        hash: res.hash,
        dir: res.dir,
        resolvedPath: resolved,
        isDir: res.isDir,
        isFile: res.isFile
      }
    } else if (scope && scope.dependencies && scope.dependencies[pkgName]) {
      const { dependencies: { [pkgName]: newScope } } = scope
      scope = newScope
    } else {
      // ENOENT
      return false
    }
  }
  return false
}

module.exports.depKey = depKey
function depKey (spec, dep) {
  const prefix = `tinked-package:${INDEX_VERSION}`
  if (spec.registry) {
    return `${prefix}:${dep.integrity || dep.resolved || spec.raw}`
  } else if (spec.type === 'git') {
    return `${prefix}:git:${dep.version}`
  } else if (spec.type === 'remote') {
    return `${prefix}:${dep.integrity || dep.version}`
  } else {
    return `${prefix}:${spec.name}:${dep.version}:${dep.resolved}:${dep.integrity}`
  }
}

module.exports.resolveEntity = resolveEntity
function resolveEntity (cache, scope, pkgName, filePath) {
  const spec = npa(pkgName, scope.version)
  if (!(scope && scope.dependencies && scope.dependencies[pkgName])) {
    return false
  }
  let pkg
  const tink = process.tink
  try {
    process.tink = null
    pkg = getPkg(cache, spec, scope, pkgName)
  } catch (e) {
    if (e.code === 'ENOENT') {
      const dep = scope.dependencies[pkgName]
      if (dep) {
        dep.name = pkgName
        fetchPackageSync(cache, dep, dep.integrity)
        pkg = getPkg(cache, spec, scope, pkgName)
      } else {
        return null
      }
    } else {
      throw e
    }
  } finally {
    process.tink = tink
  }
  const files = pkg.files
  if (!files) {
    return false
  }
  if (!filePath) {
    return { isDir: true, dir: files }
  }
  const split = filePath.split(/[/\\]+/g)
  let location = files
  while (split.length) {
    const next = split.shift()
    if (next === '.') { continue }
    location = location[next]
    if (typeof location === 'string' && !split.length) {
      return { hash: location, isFile: true }
    } else if (!location || typeof location !== 'object') {
      return false
    }
  }
  if (location) {
    return { isDir: true, dir: location }
  }
}

module.exports.readPkgLock = readPkgLock
function readPkgLock (...p) {
  const resolved = path.resolve(...p)
  let modulesIdx = resolved.lastIndexOf('node_modules')
  while (modulesIdx !== -1) {
    let substr = resolved.substr(0, modulesIdx - 1)
    const pkgLockPath = path.join(substr, pkgLockName)
    let pkgLock
    if (pkgLockCache.has(pkgLockPath)) {
      pkgLock = pkgLockCache.get(pkgLockPath)
    } else {
      const p = path.toNamespacedPath(pkgLockPath)
      try {
        pkgLock = JSON.parse((fs.readFileSync.orig || fs.readFileSync)(p))
        pkgLockCache.set(pkgLockPath, pkgLock)
      } catch (e) {
        if (e.code !== 'ENOENT') {
          throw e
        }
      }
    }
    if (pkgLock) {
      return { pkgLock, subPath: resolved.substr(modulesIdx - 1) }
    } else {
      modulesIdx = substr.lastIndexOf('node_modules')
    }
  }
  return null
}

module.exports.read = read
async function read ({ cache, hash, pkg, resolvedPath, isFile }) {
  if (!cache || !hash || !isFile) {
    throw new Error('read() requires a fully-resolved pkgmap file address')
  }
  try {
    return ccGet.byDigest(cache, hash, { memoize: true })
  } catch (err) {
    const newResolved = await fetchPackage(cache, pkg, hash)
    cache = newResolved.cache
    hash = newResolved.hash
    pkg = newResolved.pkg
    return ccGet.byDigest(cache, hash, { memoize: true })
  }
}

module.exports.readSync = readSync
function readSync ({ cache, hash, pkg, resolvedPath, isFile }) {
  if (!cache || !hash || !isFile) {
    throw new Error('readSync() requires a fully-resolved pkgmap file address')
  }
  try {
    return ccGet.sync.byDigest(cache, hash, { memoize: true })
  } catch (err) {
    const newResolved = fetchPackageSync(cache, pkg, hash)
    cache = newResolved.cache
    hash = newResolved.hash
    pkg = newResolved.pkg
    return ccGet.sync.byDigest(cache, hash, { memoize: true })
  }
}

module.exports.stat = stat
async function stat ({ cache, hash, pkg, resolvedPath, isDir }, verify) {
  if (isDir || path.basename(resolvedPath) === '.package-map.json') {
    return Object.assign(fs.lstatSync.orig(process.tink.cache), {
      mode: 16676, // read-only
      size: 64
    })
  }
  if (!cache || !hash) {
    throw new Error('stat() requires a fully-resolved pkgmap file address')
  }
  let info
  try {
    info = await ccGet.hasContent(cache, hash)
  } catch (err) {
    await fetchPackage(cache, hash, pkg)
    info = await ccGet.hasContent(cache, hash)
  }
  if (!info) {
    return false
  }
  const cpath = ccPath(cache, info.sri)
  if (verify) {
    try {
      await ssri.checkStream(
        fs.createReadStream.orig(cpath),
        info.sri
      )
    } catch (err) {
      const newResolved = await fetchPackage(cache, pkg, hash)
      cache = newResolved.cache
      hash = newResolved.hash
      pkg = newResolved.pkg
      await ssri.checkStream(
        fs.createReadStream.orig(cpath),
        info.sri
      )
    }
  }
  return Object.assign(info.stat, {
    integrity: info.sri.toString(),
    cachePath: ccPath(cache, info.sri)
  })
}

module.exports.statSync = statSync
function statSync ({ cache, hash, pkg, resolvedPath, isDir }, verify) {
  if (isDir || path.basename(resolvedPath) === '.package-map.json') {
    return Object.assign(fs.lstatSync.orig(process.tink.cache), {
      mode: 16676, // read-only
      size: 64
    })
  }
  if (!cache || !hash) {
    throw new Error('statSync() requires a fully-resolved pkgmap file address')
  }
  let info
  try {
    info = ccGet.hasContent.sync(cache, hash, { memoize: true })
  } catch (err) {
    fetchPackageSync(cache, pkg, hash)
    info = ccGet.hasContent.sync(cache, hash, { memoize: true })
  }
  if (!info) {
    return false
  }
  const cpath = ccPath(cache, info.sri)
  if (verify) {
    try {
      ssri.checkData(
        fs.readFileSync.orig(cpath),
        info.sri
      )
    } catch (err) {
      const newResolved = fetchPackageSync(cache, pkg, hash)
      cache = newResolved.cache
      hash = newResolved.hash
      pkg = newResolved.pkg
      ssri.checkData(
        fs.readFileSync.orig(cpath),
        info.sri
      )
    }
  }
  return Object.assign(info.stat, {
    integrity: info.sri.toString(),
    cachePath: ccPath(cache, info.sri)
  })
}

function getPkg (cache, spec, scope, pkgName) {
  const { metadata } = ccGet.sync(cache, depKey(spec, scope.dependencies[pkgName]), { memoize: true })
  return JSON.parse(metadata)
}

let ensurePkg
let config
async function fetchPackage (cache, pkg, hash) {
  if (!ensurePkg) { ensurePkg = require('./ensure-package.js') }
  if (!config) { config = require('./config.js') }
  await ensurePkg(cache, pkg.name, pkg, config().concat({
    cache,
    integrity: hash
  }))
}

function fetchPackageSync (cache, pkg, integrity) {
  cp.spawnSync(process.argv[0], [
    __filename,
    'ensure-pkg',
    cache,
    integrity,
    JSON.stringify(pkg)
  ], { stdio: 'inherit' })
}

if (require.main === module && process.argv[2] === 'ensure-pkg') {
  process.tink = null
  let [cache, integrity, pkg] = process.argv.slice(3)
  pkg = JSON.parse(pkg)
  if (!config) { config = require('./config.js') }
  const opts = config().concat({
    cache,
    integrity,
    log: require('npmlog'),
    'restore-missing': true
  })
  opts.log.level = opts.loglevel
  opts.log.warn('fs', 'restoring broken or missing file from package', `${pkg.name}@${pkg.version}`)
  require('./ensure-package.js')(cache, pkg.name, pkg, opts)
}
