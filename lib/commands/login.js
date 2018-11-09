'use strict'

const opn = require('opn')
const prompt = require('prompt')

const Login = module.exports = {
  command: 'login',
  describe: 'log in to the current npm registry',
  builder (y) {
    return y.help().options(Login.options)
  },
  options: Object.assign(require('../common-opts.js', {})),
  handler: async argv => login(argv)
}

const opener = (url) => new Promise((resolve, reject) => {
  try {
    opn(url)
    resolve()
  } catch (err) {
    reject(err)
  }
})

let creds = {}

const prompter = (creds) => new Promise((resolve, reject) => {
  let schema = {
    properties: {
      username: {
        description: 'Username',
        required: true
      },
      password: {
        description: 'Password',
        hidden: true
      }
    }
  }
  prompt.start()
  prompt.get(schema, (err, result) => {
    if (err) reject(err)
    creds.username = result.username
    creds.password = result.password
    resolve(creds)
  })
})

async function login (argv) {
  const libnpm = require('libnpm')

  await libnpm.profile.login(opener, prompter, {
    log: require('npmlog'),
    creds: creds
  })
    .catch(err => {
      console.error('error', err)
    })
    .then(result => {
      let newCredentials = {}
      if (result && result.token) {
        newCredentials.token = result.token
      }
      console.log(`Login authorized for user ${creds.username}`)
    })
}
