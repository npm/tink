'use strict'

const ccPath = require('cacache/lib/content/path.js')
const ccRead = require('cacache/lib/content/read.js')
const cp = require('child_process')
const fs = require('fs')
const path = require('path')
const ssri = require('ssri')

const pkgMapName = '.package-map.json'
const mapNameLen = pkgMapName.length
const pkgMapCache = new Map()

const envNoPkgMap = process.env.FROG_NO_PKG_MAP
const isPkgMapDisabled = () => process.noPkgMap || envNoPkgMap

module.exports.resolve = resolve
module.exports._clearCache = () => pkgMapCache.clear()

function resolve (...p) {
  if (!process.tink) { throw new Error('only works inside a tink process') }
  // Resolves a given path pointing _inside_ a `.package-map.json` into an
  // expected package + file hash.
  if (isPkgMapDisabled()) { return null }
  const resolved = path.resolve(...p)
  const result = readPkgMap(resolved)
  if (!result) { return result }
  const {pkgMap, pkgMapIdx} = result
  if (!pkgMap) { return false }
  let subPath = resolved.substr(pkgMapIdx - 1)
  let pkgName, filePath
  let scope = pkgMap
  while (subPath) {
    if (scope.path_prefix && subPath.startsWith(scope.path_prefix)) {
      subPath = subPath.substr(scope.path_prefix.length)
      if (!subPath) { return false }
    }
    [, pkgName, subPath, filePath] = subPath.match(/^[/\\]((?:@[^/\\]+[/\\])?[^/\\]+)([/\\]?(.*))/)
    if (
      scope.packages &&
      scope.packages[pkgName] &&
      scope.packages[pkgName].files &&
      scope.packages[pkgName].files[filePath] &&
      typeof scope.packages[pkgName].files[filePath] === 'string'
    ) {
      const pkg = scope.packages[pkgName]
      const hash = pkg.files[filePath]
      return {
        cache: process.tink.cache,
        pkg,
        hash,
        resolvedPath: resolved
      }
    } else if (scope && scope.scopes && scope.scopes[pkgName]) {
      const {scopes: {[pkgName]: newScope}} = scope
      scope = newScope
    } else {
      // ENOENT
      return false
    }
  }
  return false
}

module.exports.readPkgMap = readPkgMap
function readPkgMap (...p) {
  const resolved = path.resolve(...p)
  const pkgMapIdx = resolved.indexOf(pkgMapName)
  if (pkgMapIdx === -1 || pkgMapIdx + mapNameLen + 1 >= resolved.length) {
    // Not in a pkgmapped path, or reading a .package-map.json itself
    return null
  }
  const pkgMapPath = resolved.substr(0, pkgMapIdx + mapNameLen)
  let pkgMap
  if (pkgMapCache.has(pkgMapPath)) {
    pkgMap = pkgMapCache.get(pkgMapPath)
  } else {
    try {
      const p = path.toNamespacedPath ? path.toNamespacedPath(pkgMapPath) : pkgMapPath
      pkgMap = JSON.parse(fs.readFileSync(p))
      pkgMapCache.set(pkgMapPath, pkgMap)
    } catch (err) {
      pkgMapCache.set(pkgMapPath, false)
    }
  }
  return {pkgMap, pkgMapIdx}
}

module.exports.read = read
async function read ({cache, hash, pkg, resolvedPath}) {
  if (!cache || !hash) {
    throw new Error('read() requires a fully-resolved pkgmap file address')
  }
  try {
    return ccRead(cache, hash)
  } catch (err) {
    const newResolved = await repairPackage({cache, hash, pkg, resolvedPath})
    cache = newResolved.cache
    hash = newResolved.hash
    pkg = newResolved.pkg
    return ccRead(cache, hash)
  }
}

module.exports.readSync = readSync
function readSync ({cache, hash, pkg, resolvedPath}) {
  if (!cache || !hash) {
    throw new Error('readSync() requires a fully-resolved pkgmap file address')
  }
  try {
    return ccRead.sync(cache, hash)
  } catch (err) {
    const newResolved = repairPackageSync({cache, hash, pkg, resolvedPath})
    cache = newResolved.cache
    hash = newResolved.hash
    pkg = newResolved.pkg
    return ccRead.sync(cache, hash)
  }
}

module.exports.stat = stat
async function stat ({cache, hash, pkg, resolvedPath}, verify) {
  if (!cache || !hash) {
    throw new Error('stat() requires a fully-resolved pkgmap file address')
  }
  let info
  try {
    info = await ccRead.hasContent(cache, hash)
  } catch (err) {
    await repairPackage(cache, hash, pkg)
    info = await ccRead.hasContent(cache, hash)
  }
  if (!info) {
    return false
  }
  const cpath = ccPath(cache, info.sri)
  if (verify) {
    try {
      await ssri.checkStream(
        fs.createReadStream(cpath),
        info.sri
      )
    } catch (err) {
      const newResolved = await repairPackage({cache, hash, pkg, resolvedPath})
      cache = newResolved.cache
      hash = newResolved.hash
      pkg = newResolved.pkg
      await ssri.checkStream(
        fs.createReadStream(cpath),
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
function statSync ({cache, hash, pkg, resolvedPath}, verify) {
  if (!cache || !hash) {
    throw new Error('statSync() requires a fully-resolved pkgmap file address')
  }
  let info
  try {
    info = ccRead.hasContent.sync(cache, hash)
  } catch (err) {
    repairPackageSync(cache, hash, pkg)
    info = ccRead.hasContent.sync(cache, hash)
  }
  if (!info) {
    return false
  }
  const cpath = ccPath(cache, info.sri)
  if (verify) {
    try {
      ssri.checkData(
        fs.readFileSync(cpath),
        info.sri
      )
    } catch (err) {
      const newResolved = repairPackageSync({cache, hash, pkg, resolvedPath})
      cache = newResolved.cache
      hash = newResolved.hash
      pkg = newResolved.pkg
      ssri.checkData(
        fs.readFileSync(cpath),
        info.sri
      )
    }
  }
  return Object.assign(info.stat, {
    integrity: info.sri.toString(),
    cachePath: ccPath(cache, info.sri)
  })
}

let ensurePkg
let config
async function repairPackage ({cache, hash, pkg, resolvedPath}) {
  if (!ensurePkg) { ensurePkg = require('./ensure-package.js') }
  if (!config) { config = require('./config.js') }
  await ensurePkg(pkg.name, pkg, config().concat({
    cache,
    integrity: hash
  }))
  return resolve(resolvedPath)
}

function repairPackageSync ({cache, hash, pkg, resolvedPath}) {
  cp.spawnSync(process.argv[0], [
    __filename,
    'ensure-pkg',
    cache,
    hash,
    JSON.stringify(pkg)
  ], {stdio: 'inherit'})
  return resolve(resolvedPath)
}

if (require.main === module && process.argv[2] === 'ensure-pkg') {
  let [cache, integrity, pkg] = process.argv.slice(3)
  pkg = JSON.parse(pkg)
  if (!config) { config = require('./config.js') }
  const opts = config().concat({
    cache,
    integrity,
    log: require('npmlog'),
    restore: true
  })
  opts.log.level = opts.loglevel
  opts.log.warn('fs', 'restoring broken or missing file from package', `${pkg.name}@${pkg.version}`)
  require('./ensure-package.js')(pkg.name, pkg, opts)
}
