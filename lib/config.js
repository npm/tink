'use strict'

const fs = require('fs')
const figgyPudding = require('figgy-pudding')
const ini = require('ini')
const path = require('path')

const tinkConfig = figgyPudding(require('./common-opts.js'))

module.exports = getNpmConfig
module.exports.pudding = tinkConfig
function getNpmConfig (_opts) {
  const opts = tinkConfig(_opts)
  const configs = process.cwd().split(path.sep).reduce((acc, next) => {
    acc.path = path.join(acc.path, next)
    acc.configs.push(maybeReadIni(path.join(acc.path, '.npmrc')))
    acc.configs.push(maybeReadIni(path.join(acc.path, 'npmrc')))
    return acc
  }, {
    path: '',
    configs: []
  }).configs.concat(
    maybeReadIni(opts.userconfig)
  ).filter(x => x)
  const env = Object.keys(process.env).reduce((acc, key) => {
    if (key.match(/^(?:npm|tink)_config_/i)) {
      const newKey = key.toLowerCase()
        .replace(/^(?:npm|tink)_config_/i, '')
        .replace(/(?!^)_/g, '-')
      acc[newKey] = process.env[key]
    }
    return acc
  }, {})
  const newOpts = tinkConfig(...configs, env, _opts)
  if (newOpts.cache) {
    return newOpts.concat({
      cache: path.join(newOpts.cache, '_cacache')
    })
  } else {
    return newOpts
  }
}

function maybeReadIni (f) {
  let txt
  try {
    txt = fs.readFileSync(f, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') {
      return ''
    } else {
      throw err
    }
  }
  return ini.parse(txt)
}
