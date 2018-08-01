'use strict'

const figgyPudding = require('figgy-pudding')
const spawn = require('child_process').spawn

const frogConfig = module.exports = figgyPudding({
  also: {},
  cache: {},
  dev: {},
  development: {},
  force: {},
  global: {},
  'ignore-scripts': {},
  log: {},
  loglevel: {},
  only: {},
  prefix: {},
  production: {},
  then: {}, // omfg
  umask: {}
})

module.exports.fromNpm = getNpmConfig
async function getNpmConfig (argv) {
  const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const child = spawn(npmBin, [
    'config', 'ls', '--json', '-l'
    // We add argv here to get npm to parse those options for us :D
  ].concat(argv || []), {
    env: process.env,
    cwd: process.cwd(),
    stdio: [0, 'pipe', 2]
  })

  let stdout = ''
  if (child.stdout) {
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
  }

  return await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 127) {
        reject(new Error('`npm` command not found. Please ensure you have npm@5.4.0 or later installed.'))
      } else {
        try {
          resolve(frogConfig(JSON.parse(stdout)))
        } catch (e) {
          reject(new Error('`npm config ls --json` failed to output json. Please ensure you have npm@5.4.0 or later installed.'))
        }
      }
    })
  })
}
