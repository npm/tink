'use strict'

const { get: ccGet } = require('cacache')
const ccPath = require('cacache/lib/content/path.js')
const cp = require('child_process')
const fs = require('fs')
const path = require('path')
const ssri = require('ssri')

const INDEX_VERSION = module.exports.INDEX_VERSION = '2.0.0'

const pkgLockName = 'package-lock.json'
const pkgLockCache = new Map()

const envNoPkgLock = process.env.TINK_NO_PKG_LOCK
const isPkgLockDisabled = () => !process.tink || process.tink.noPkgLock || envNoPkgLock

module.exports.resolve = resolve
module.exports._clearCache = () => pkgLockCache.clear()

const tinkDir = path.dirname(__dirname)

function resolve (...p) {
  if (isPkgLockDisabled()) { return null }
  const resolved = path.resolve(...p)

  if (!process.tink._isSelf_) {
    if ((tinkDir && resolved.match(tinkDir)) || (process.tink.cache && resolved.match(process.tink.cache))) {
      // Don't be a smartass about our own sources and cache...
      return null
    }
  }

  const result = readPkgLock(resolved)
  if (!result) { return result }
  let { pkgLock, subPath } = result
  if (!pkgLock) { return false }
  let pkgName, filePath
  let scope = pkgLock
  while (subPath) {
    if (subPath.startsWith('/node_modules')) {
      subPath = subPath.substr('/node_modules'.length)
      if (!subPath) {
        return {
          cache: process.tink.cache,
          scope,
          dir: scope.dependencies,
          resolvedPath: resolved,
          isDir: true,
          isFile: false
        }
      }
    }
    [, pkgName, subPath, filePath] = subPath.match(/^[/\\]((?:@[^/\\]+[/\\])?[^/\\]+)([/\\]?(.*))/)
    let res = resolveEntity(process.tink.cache, scope, pkgName, filePath)
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
function depKey (pkgName, dep) {
  return `tinked-package:${
    INDEX_VERSION
  }:${
    pkgName
  }:${
    dep.version
  }:${
    dep.resolved
  }:${
    dep.integrity
  }`
}

module.exports.resolveEntity = resolveEntity
function resolveEntity (cache, scope, pkgName, filePath) {
  if (!(scope && scope.dependencies && scope.dependencies[pkgName])) {
    return false
  }
  if (scope.dependencies[pkgName].bundled) {
    return null
  }
  let pkg
  try {
    pkg = getPkg(cache, scope, pkgName)
  } catch (e) {
    if (e.code !== 'ENOENT') { throw e }
    const dep = scope.dependencies[pkgName]
    if (dep && !dep.bundled) {
      dep.name = pkgName
      fetchPackageSync(cache, dep, dep.integrity)
      pkg = getPkg(cache, scope, pkgName)
    } else {
      return null
    }
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
function readPkgLock (resolved) {
  const match = resolved.match(/([/\\]+node_modules)[/\\]?/i)
  let modulesIdx = match && match.index
  let pkgLock
  while (!pkgLock && modulesIdx >= 0) {
    let substr = resolved.substr(0, modulesIdx)
    const pkgLockPath = path.join(substr, pkgLockName)
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
        } else {
          pkgLockCache.set(pkgLockPath, null)
        }
      }
    }
    if (pkgLock) {
      return { pkgLock, subPath: resolved.substr(modulesIdx) }
    } else {
      const newMatch = substr.match(/([/\\]+node_modules)[/\\]?/i)
      modulesIdx = newMatch && newMatch.index
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
    return ccGet.byDigest(newResolved.cache, newResolved.hash, { memoize: true })
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
    return ccGet.sync.byDigest(newResolved.cache, newResolved.hash, { memoize: true })
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

const pkgCache = new Map()
function getPkg (cache, scope, pkgName) {
  const key = depKey(pkgName, scope.dependencies[pkgName])
  if (pkgCache.has(key)) {
    return pkgCache.get(key)
  } else {
    const tink = process.tink
    process.tink = null
    try {
      const { metadata } = ccGet.sync(cache, key)
      const ret = JSON.parse(metadata)
      pkgCache.set(key, ret)
      return ret
    } finally {
      process.tink = tink
    }
  }
}

function notCachedError (cache, pkg, hash) {
  throw Object.assign(
    new Error(`A file belonging to ${pkg.name}@${pkg.version} is missing and can't be restored because you are in production mode. Run \`tink prepare\` and try again. (integrity: ${hash})`), { code: 'ENOTCACHED' }
  )
}

let ensurePkg
let ensureDep
async function fetchPackage (cache, pkg, hash) {
  if (process.tink.config.production) {
    return notCachedError(cache, pkg, hash)
  }
  if (!ensurePkg) { ensurePkg = require('./ensure-package.js') }
  if (!ensureDep) { ensureDep = require('./lock-worker.js') }
  await ensureDep(cache, hash, pkg, process.tink.config)
}

function fetchPackageSync (cache, pkg, integrity) {
  if (process.tink.config.production) {
    return notCachedError(cache, pkg, integrity)
  }
  cp.spawnSync(process.argv[0], [
    require.resolve('./lock-worker.js'),
    'ensure-pkg',
    cache,
    integrity,
    JSON.stringify(pkg),
    JSON.stringify(process.tink.config.concat({ log: null }) || {})
  ], { stdio: 'inherit' })
}
