'use strict'

const Add = module.exports = {
  command: 'add <pkg>',
  describe: 'Add a dependency.',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Add.options)
  },
  options: Object.assign(require('../common-opts.js', {
    'development': {
      alias: ['dev', 'D'],
      describe: 'Add this dependency as a devDependency',
      type: 'boolean'
    },
    'production': {
      alias: ['prod', 'P'],
      describe: 'Add this dependency as a regular dependency',
      type: 'boolean',
      default: true
    },
    'bundle': {
      alias: ['bundled', 'B'],
      describe: 'Add this dependency as a bundledDependency',
      type: 'boolean'
    }
  })),
  handler: async argv => add(argv)
}

async function add (argv) {
  const BB = require('bluebird')

  const figgyPudding = require('figgy-pudding')
  const npmConfig = require('../config.js')
  const spawn = require('child_process').spawn

  const AddConfig = figgyPudding({
    log: {},
    silent: {}
  }, { other () { return true } })

  const opts = AddConfig(npmConfig(argv))

  await new BB((resolve, reject) => {
    const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    const child = spawn(npmBin, [
      'add', opts.pkg, '--package-lock-only'
      // We add argv here to get npm to parse those options for us :D
    ].concat(process.argv.slice(3).filter(x => {
      return !['--bundle', '--development', '--production'].find(y => y === x)
    }) || []), {
      env: process.env,
      cwd: process.cwd(),
      stdio: 'inherit'
    })
    child.on('error', reject)
    child.on('close', code => {
      if (code === 127) {
        reject(new Error('`npm` command not found. Please ensure you have npm@5.4.0 or later installed.'))
      } else if (code) {
        reject(new Error('non-zero exit code: ' + code))
      } else {
        resolve()
      }
    })
  })
  await require('./prepare.js').handler(opts)
}
