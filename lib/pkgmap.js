'use strict'

const ccPath = require('cacache/lib/content/path.js')
const ccRead = require('cacache/lib/content/read.js')
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
  // Resolves a given path pointing _inside_ a `.package-map.json` into an
  // expected package + file hash.
  if (isPkgMapDisabled()) { return null }
  const resolved = path.resolve(...p)
  const pkgMapIdx = resolved.indexOf(pkgMapName)
  if (pkgMapIdx !== -1 && pkgMapIdx + mapNameLen < resolved.length) {
    const pkgMapPath = resolved.substr(0, pkgMapIdx + mapNameLen)
    let pkgMap
    if (pkgMapCache.has(pkgMapPath)) {
      pkgMap = pkgMapCache.get(pkgMapPath)
    } else {
      try {
        const p = path.toNamespacedPath(pkgMapPath)
        pkgMap = JSON.parse(fs.readFileSync(p))
        pkgMapCache.set(p, pkgMap)
      } catch (err) {
        return false
      }
    }
    if (!pkgMap) { return false }
    let subPath = resolved.substr(pkgMapIdx + mapNameLen + 1)
    let pkgName
    let scope = pkgMap
    while (subPath) {
      [, pkgName, subPath] = subPath.match(/^((?:@[^/\\]+[/\\])?[^/\\]+)[/\\]?(.*)/)
      if (pkgName === scope.path_separator) {
        continue
      }
      if (
        scope.packages &&
        scope.packages[pkgName] &&
        scope.packages[pkgName].files &&
        scope.packages[pkgName].files[subPath]
      ) {
        const pkg = scope.packages[pkgName]
        const hash = pkg.files[subPath]
        return {
          cache: pkgMap.cache,
          pkg,
          hash
        }
      } else if (scope && scope.scopes && scope.scopes[pkgName]) {
        const {scopes: {[pkgName]: newScope}} = scope
        scope = newScope
      }
    }
    return false
  }
  return null
}

module.exports.read = read
async function read ({cache, hash}) {
  if (!cache || !hash) {
    throw new Error('read() requires a fully-resolved pkgmap file address')
  }
  return ccRead(cache, hash)
}

module.exports.readSync = readSync
function readSync ({cache, hash}) {
  if (!cache || !hash) {
    throw new Error('readSync() requires a fully-resolved pkgmap file address')
  }
  return ccRead.sync(cache, hash)
}

module.exports.stat = stat
async function stat ({cache, hash}, verify) {
  if (!cache || !hash) {
    throw new Error('stat() requires a fully-resolved pkgmap file address')
  }
  const info = await ccRead.hasContent(cache, hash) || false
  if (info) {
    const cpath = ccPath(cache, info.ssri)
    if (verify) {
      await ssri.checkStream(
        fs.createReadStream(cpath),
        info.sri
      )
    }
    return Object.assign(info.stat, {
      integrity: info.sri.toString(),
      cachePath: ccPath(cache, info.sri)
    })
  }
}

module.exports.statSync = statSync
function statSync ({cache, hash}, verify) {
  if (!cache || !hash) {
    throw new Error('statSync() requires a fully-resolved pkgmap file address')
  }
  const info = ccRead.hasContent.sync(cache, hash) || false
  if (info) {
    const cpath = ccPath(cache, info.sri)
    if (verify) {
      ssri.checkData(
        fs.readFileSync(cpath),
        info.sri
      )
    }
    return Object.assign(info.stat, {
      integrity: info.sri.toString(),
      cachePath: ccPath(cache, info.sri)
    })
  }
}
