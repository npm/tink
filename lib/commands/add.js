'use strict'

const BB = require('bluebird')

const figgyPudding = require('figgy-pudding')
const prepare = require('./prepare.js')
const spawn = require('child_process').spawn

const AddConfig = figgyPudding({
  log: {},
  silent: {}
}, { other () { return true } })

module.exports = add
async function add (argv, opts) {
  opts = AddConfig(opts)
  const packages = argv.packages || []

  await new BB((resolve, reject) => {
    const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    const child = spawn(npmBin, [
      'add', ...packages, '--package-lock-only'
      // We add argv here to get npm to parse those options for us :D
    ].concat(process.argv.slice(packages.length + 3).filter(x => {
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
  await prepare(argv, opts)
}
