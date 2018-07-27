'use strict'

const BB = require('blebird')

const binLink = require('bin-links')
const buildLogicalTree = require('npm-logical-tree')
const config = require('./lib/config.js')
const fs = require('graceful-fs')
const getPrefix = require('find-npm-prefix')
const lifecycle = require('npm-lifecycle')
const lockVerify = require('lock-verify')
const mkdirp = BB.promisify(require('mkdirp'))
const npa = require('npm-package-arg')
const pacote = require('pacote')
const path = require('path')
const readPkgJson = BB.promisify(require('read-package-json'))
const rimraf = BB.promisify(require('rimraf'))

const readFileAsync = BB.promisify(fs.readFile)
const statAsync = BB.promisify(fs.stat)
const symlinkAsync = BB.promisify(fs.symlink)

class Installer {
  constructor (opts) {
    this.opts = config(opts)

    // Stats
    this.startTime = Date.now()
    this.runTime = 0
    this.timings = { scripts: 0 }
    this.pkgCount = 0

    // Misc
    this.log = this.opts.log ||
      ((level, type, ...msgs) => process.emit(level, type, ...msgs))

    this.pkg = null
    this.tree = null
    this.failedDeps = new Set()
  }

  async timedStage (name) {
    const start = Date.now()
    const ret = await this[name].apply(this, [].slice.call(arguments, 1))
    this.timings[name] = Date.now() - start
    this.log('info', name, `Done in ${this.timings[name] / 1000}s`)
    return ret
  }

  async run () {
    try {
      await this.timedStage('prepare')
      await this.timedStage('fetchTree', this.tree)
      await this.timedStage('buildTree', this.tree)
      await this.timedStage('garbageCollect', this.tree)
      await this.timedStage('runScript', 'prepublish', this.pkg, this.prefix)
      await this.timedStage('runScript', 'prepare', this.pkg, this.prefix)
      await this.timedStage('teardown')
      this.runTime = Date.now() - this.startTime
      this.log(
        'info',
        'run-scripts',
        `total script time: ${this.timings.scripts / 1000}s`
      )
      this.log(
        'info',
        'run-time',
        `total run time: ${this.runTime / 1000}s`
      )
    } catch (err) {
      if (err.message.match(/aggregate error/)) {
        throw err[0]
      } else {
        throw err
      }
    } finally {
      await this.timedStage('teardown')
    }
    return this
  }

  async prepare () {
    this.log('info', 'prepare', 'initializing installer')
    this.log('verbose', 'prepare', 'starting workers')

    const prefix = (
      this.opts.prefix && this.opts.global
        ? this.opts.prefix
        // There's some Special™ logic around the `--prefix` config when it
        // comes from a config file or env vs when it comes from the CLI
        : process.argv.some(arg => arg.match(/^\s*--prefix\s*/i))
          ? this.opts.prefix
          : await getPrefix(process.cwd())
    )
    this.prefix = prefix
    this.log('verbose', 'prepare', 'installation prefix: ' + prefix)
    await BB.join(
      readJson(prefix, 'package.json'),
      readJson(prefix, 'package-lock.json', true),
      readJson(prefix, 'npm-shrinkwrap.json', true),
      (pkg, lock, shrink) => {
        if (shrink) {
          this.log('verbose', 'prepare', 'using npm-shrinkwrap.json')
        } else if (lock) {
          this.log('verbose', 'prepare', 'using package-lock.json')
        }
        pkg._shrinkwrap = shrink || lock
        this.pkg = pkg
      }
    )
    let stat
    try {
      stat = await statAsync(
        path.join(this.prefix, 'node_modules')
      )
    } catch (err) {
      if (err.code !== 'ENOENT') { throw err }
    }
    if (stat) {
      this.log(
        'warn',
        'prepare',
        'removing existing node_modules/ before installation'
      )
    }
    await BB.join(
      this.checkLock(),
      stat && rimraf(path.join(this.prefix, 'node_modules'))
    )
    // This needs to happen -after- we've done checkLock()
    this.tree = buildLogicalTree(this.pkg, this.pkg._shrinkwrap)
    this.log('silly', 'tree', this.tree)
    this.expectedTotal = 0
    this.tree.forEach((dep, next) => {
      this.expectedTotal++
      next()
    })
  }

  async teardown () {
    this.log('verbose', 'teardown', 'shutting down')
  }

  async checkLock () {
    this.log('verbose', 'checkLock', 'verifying package-lock data')
    const pkg = this.pkg
    const prefix = this.prefix
    if (!pkg._shrinkwrap || !pkg._shrinkwrap.lockfileVersion) {
      throw new Error(`frog can only install packages with an existing package-lock.json or npm-shrinkwrap.json with lockfileVersion >= 1. Run an install with npm@5 or later to generate it, then try again.`)
    }
    const result = await lockVerify(prefix)
    if (result.status) {
      result.warnings.forEach(w => this.log('warn', 'lockfile', w))
    } else {
      throw new Error(
        'frog can only install packages when your package.json and package-lock.json or ' +
        'npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` ' +
        'before continuing.\n\n' +
        result.warnings.map(w => 'Warning: ' + w).join('\n') + '\n' +
        result.errors.join('\n') + '\n'
      )
    }
  }

  async fetchTree (tree) {
    this.log('verbose', 'fetchTree', 'making sure all required deps are in the cache')
    const cg = this.log('newItem', 'fetchTree', this.expectedTotal)
    await tree.forEachAsync(async (dep, next) => {
      if (!this.checkDepEnv(dep)) { return }
      const depPath = dep.path(this.prefix)
      const spec = npa.resolve(dep.name, dep.version, this.prefix)
      if (dep.isRoot) {
        return next()
      } else if (spec.type === 'directory') {
        const relative = path.relative(path.dirname(depPath), spec.fetchSpec)
        this.log('silly', 'fetchTree', `${dep.name}@${spec.fetchSpec} -> ${depPath} (symlink)`)
        await mkdirp(path.dirname(depPath))
        try {
          await symlinkAsync(relative, depPath, 'junction')
        } catch (e) {
          await rimraf(depPath)
          await symlinkAsync(relative, depPath, 'junction')
        }
        await next()
        this.pkgCount++
        cg.completeWork(1)
      } else {
        this.log('silly', 'fetchTree', `${dep.name}@${dep.version} -> ${depPath}`)
        let wasBundled = false
        if (dep.bundled) {
          try {
            wasBundled = !!await statAsync(path.join(depPath, 'package.json'))
          } catch (err) {
            if (err.code !== 'ENOENT') { throw err }
          }
        }
        // Don't extract if a bundled dep is actually present
        if (wasBundled) {
          cg.completeWork(1)
          return next()
        } else {
          await ensureDep(dep.name, dep, depPath, this.opts)
          cg.completeWork(1)
          this.pkgCount++
          return next()
        }
      }
    }, {concurrency: 50, Promise: BB})
    cg.finish()
  }

  checkDepEnv (dep) {
    const includeDev = (
      // Covers --dev and --development (from npm config itself)
      this.config.get('dev') ||
      (
        !/^prod(uction)?$/.test(this.config.get('only')) &&
        !this.config.get('production')
      ) ||
      /^dev(elopment)?$/.test(this.config.get('only')) ||
      /^dev(elopment)?$/.test(this.config.get('also'))
    )
    const includeProd = !/^dev(elopment)?$/.test(this.config.get('only'))
    return (dep.dev && includeDev) || (!dep.dev && includeProd)
  }

  async buildTree (tree, pkgJsons) {
    this.log('verbose', 'buildTree', 'finalizing tree and running scripts')
    await tree.forEachAsync(async (dep, next) => {
      if (!this.checkDepEnv(dep)) { return }
      try {
        const spec = npa.resolve(dep.name, dep.version)
        const depPath = dep.path(this.prefix)
        const pkg = pkgJsons.get(dep)
        this.log('silly', 'buildTree', `linking ${spec}`)
        await this.runScript('preinstall', pkg, depPath)
        await next() // build children between preinstall and binLink
        // Don't link root bins
        if (
          dep.isRoot ||
          !(pkg.bin || pkg.man || (pkg.directories && pkg.directories.bin))
        ) {
          // We skip the relatively expensive readPkgJson if there's no way
          // we'll actually be linking any bins or mans
          return
        }
        const pkgJson = await readPkgJson(path.join(depPath, 'package.json'))
        await binLink(pkgJson, depPath, false, {
          force: this.config.get('force'),
          ignoreScripts: this.config.get('ignore-scripts'),
          log: Object.assign({}, this.log, { info: () => {} }),
          name: pkg.name,
          pkgId: pkg.name + '@' + pkg.version,
          prefix: this.prefix,
          prefixes: [this.prefix],
          umask: this.config.get('umask')
        })
        await this.runScript('install', pkg, depPath)
        await this.runScript('postinstall', pkg, depPath)
      } catch (e) {
        if (dep.optional) {
          this.failedDeps.add(dep)
        } else {
          throw e
        }
      }
    }, {concurrency: 1, Promise: BB})
  }

  async updateInstallScript (dep, pkg) {
    const depPath = dep.path(this.prefix)
    let stat
    try {
      stat = statAsync(path.join(depPath, 'binding.gyp'))
    } catch (err) {
      if (err.code !== 'ENOENT') { throw err }
    }
    if (stat) {
      if (!pkg.scripts) {
        pkg.scripts = {}
      }
      pkg.scripts.install = 'node-gyp rebuild'
    }
    return pkg
  }

  // A cute little mark-and-sweep collector!
  async garbageCollect (tree) {
    if (!this.failedDeps.size) { return }
    const purged = await sweep(
      tree,
      this.prefix,
      mark(tree, this.failedDeps)
    )
    this.purgedDeps = purged
    this.pkgCount -= purged.size
  }

  async runScript (stage, pkg, pkgPath) {
    const start = Date.now()
    if (!this.config.get('ignore-scripts')) {
      // TODO(mikesherov): remove pkg._id when npm-lifecycle no longer relies on it
      pkg._id = pkg.name + '@' + pkg.version
      const opts = this.config.toLifecycle()
      const ret = await lifecycle(pkg, stage, pkgPath, opts)
      this.timings.scripts += Date.now() - start
      return ret
    }
  }
}
module.exports = Installer
module.exports.CipmConfig = require('./lib/config/npm-config.js').CipmConfig

function mark (tree, failed) {
  const liveDeps = new Set()
  tree.forEach((dep, next) => {
    if (!failed.has(dep)) {
      liveDeps.add(dep)
      next()
    }
  })
  return liveDeps
}

async function sweep (tree, prefix, liveDeps) {
  const purged = new Set()
  await tree.forEachAsync(async (dep, next) => {
    await next()
    if (
      !dep.isRoot && // never purge root! 🙈
      !liveDeps.has(dep) &&
      !purged.has(dep)
    ) {
      purged.add(dep)
      await rimraf(dep.path(prefix))
    }
  }, {concurrency: 50, Promise: BB})
  return purged
}

function stripBOM (str) {
  return str.replace(/^\uFEFF/, '')
}

module.exports._readJson = readJson
async function readJson (jsonPath, name, ignoreMissing) {
  const str = await readFileAsync(path.join(jsonPath, name), 'utf8')
  try {
    return JSON.parse(stripBOM(str))
  } catch (err) {
    if (err.code !== 'ENOENT' || ignoreMissing) {
      throw err
    }
  }
}
