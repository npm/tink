'use strict'

const Profile = module.exports = {
  command: 'profile',
  describe: 'Provides functions for fetching and updating an npmjs.com profile.',
  aliases: ['p'],
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Profile.options)
      .demandCommand(1, 'Profile subcommand is required')
      .recommendCommands()
      .command({
        command: 'get [<property>]',
        describe: 'Display all of the properties of your profile, or one or more specific properties.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: argv => get(argv)
      })
      .command({
        command: 'set <property> <value>',
        describe: 'Update profile information for the authenticated user.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: argv => set(argv)
      })
      .command({
        command: 'set password',
        describe: 'Update password',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: argv => setPassword(argv)
      })
      .command({
        command: 'disable-2fa',
        describe: 'Disable two-factor authentication.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: argv => disable2fa(argv)
      })
      .command({
        command: 'enable-2fa [<mode>]',
        describe: 'Enable two-factor authentication. ',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: argv => enable2fa(argv)
      })
      .command({
        command: 'create-token',
        describe: 'Create a new authentication token, possibly with restrictions.',
        builder: y => y.help('help', 'h').options(Object.assign({}, ProfileSubcommandsOptions, {
          'read-only': {
            alias: 'ro',
            describe: 'Readonly',
            type: 'boolean',
            default: false
          },
          cidr_whitelist: {
            alias: 'cidr',
            describe: 'CIDR ranges to limit use of this token to.',
            type: 'array',
            default: []
          }
        })),
        handler: argv => createToken(argv)
      })
      .command({
        command: 'remove-token <token|key>',
        aliases: ['revoke-token', 'rm'],
        describe: 'Remove a specific authentication token.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: argv => removeToken(argv)
      })
      .command({
        command: 'list-tokens',
        aliases: ['lt'],
        describe: 'Fetch a list of all of the authentication tokens the authenticated user has.',
        builder: y => y.help('help', 'h').options(ProfileSubcommandsOptions),
        handler: argv => listTokens(getOptions(argv))
      })
  },
  options: Object.assign({}, require('../common-opts'), {})
}

const libnpm = require('libnpm')
const figgyPudding = require('figgy-pudding')
const { h, renderToString } = require('ink') // eslint-disable-line
const Table = require('ink-table').default
const log = require('npmlog')
const readPassword = require('../utils/read-password')
const otplease = require('../utils/otplease.js')
const npmConfig = require('../config.js')

const ProfileConfig = figgyPudding({
  json: {},
  parseable: {},
  silent: {},
  loglevel: {},
  token: {},
  username: {},
  password: {}
})

const ProfileSubcommandsOptions = {
  token: {
    alias: 't',
    describe: 'Used for Bearer auth',
    type: 'string'
  },
  username: {
    alias: 'u',
    describe: 'Used for Basic auth',
    type: 'string'
  },
  password: {
    alias: 'p',
    describe: 'Used for Basic auth',
    type: 'string'
  }
}

const tableHeaders = ['token', 'key', 'cidr_whitelist', 'readonly', 'created', 'updated']

const getOptions = argv => ProfileConfig(npmConfig(argv))

const logError = (err) => console.error(`Error code: ${err.code} => ${err.message}`)

const mapTokenToTable = (token, options = { trimToken: true }) => {
  token.key = token.key.substring(0, 6)
  token.token = options.trimToken ? token.token.substring(0, 6) + '...' : token.token
  token.readonly = token.readonly ? 'yes' : 'no'
  return token
}

async function get (argv) {
  const opts = getOptions(argv)

  const parseTfaInfo = (tfa) => {
    // When 'tfa' is disabled or pending, print 'disabled'
    return !tfa || tfa.pending ? 'disabled' : tfa.mode
  }

  try {
    const profileInfo = await libnpm.profile.get(opts)

    if (argv.property) {
      console.log(profileInfo[argv.property] || '')
    } else if (opts.json) {
      console.log(JSON.stringify(profileInfo, null, 2))
    } else if (opts.parseable) {
      Object.keys(profileInfo).forEach(key => {
        const value = key === 'tfa'
          ? parseTfaInfo(profileInfo[key])
          : profileInfo[key]

        if (value) {
          console.log([key, value].join('\t'))
        }
      })
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      profileInfo.tfa = parseTfaInfo(profileInfo.tfa)

      // TODO: Maybe we should use another type of table?
      console.log(renderToString(<Table data={[profileInfo]} />))
    }
  } catch (e) {
    logError(e)
  }
}

async function set (argv) {
  const opts = getOptions(argv)

  const validProperties = ['email', 'password', 'fullname', 'homepage', 'freenode', 'twitter', 'github']

  // Check if the property exists
  if (!validProperties.includes(argv.property)) {
    console.error(`"${argv.property}" is not a property we can set. Valid properties are: ${validProperties.join(', ')}`)
    return
  }

  try {
    const newProfileInfo = await libnpm.profile.set({ [argv.property]: argv.value }, opts)

    if (opts.json) {
      console.log(JSON.stringify({ [argv.property]: newProfileInfo[argv.property] }, null, 2))
    } else if (opts.parseable) {
      console.log([argv.property, newProfileInfo[argv.property]].join('\t'))
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      console.log(`Set ${argv.property} to ${newProfileInfo[argv.property]}`)
    }
  } catch (e) {
    logError(e)
  }
}

async function setPassword (argv) {
  const opts = getOptions(argv)

  try {
    const currentPassword = await readPassword('Current password: ')
    const newPassword = await readPassword('New password: ')
    const newPasswordConfirmation = await readPassword('New password again: ')

    // REVIEW: Give to the user another try?
    if (newPassword !== newPasswordConfirmation) {
      console.error('\nPasswords do not match.')
      return
    }

    // Check if OTP is required
    await otplease(opts, opts => libnpm.profile.set({
      password: {
        old: currentPassword,
        new: newPassword
      }
    }, opts))

    if (opts.json) {
      console.log(JSON.stringify({}, null, 2))
    } else if (opts.parseable) {
      console.log(['password', 'undefined'].join('\t'))
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      console.log(`Set password`)
    }
  } catch (e) {
    logError(e)
  }
}

async function disable2fa (argv) {
  const opts = getOptions(argv)

  try {
    // Check if tfa is enabled
    const profileInfo = await libnpm.profile.get(opts)
    if (!profileInfo.tfa) {
      console.log('Two factor authentication is not enabled.')
      return
    }

    const password = await readPassword()
    const newProfileInfo = await otplease(opts, opts => libnpm.profile.set({
      tfa: {
        password,
        mode: 'disable'
      }
    }, opts))

    if (opts.json) {
      console.log(JSON.stringify({ tfa: newProfileInfo.tfa }, null, 2))
    } else if (opts.parseable) {
      console.log(['tfa', newProfileInfo.tfa].join('\t'))
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      console.log('Two factor authentication disabled.')
    }
  } catch (e) {
    logError(e)
  }
}

async function enable2fa (argv) {
  const url = require('url')
  const queryString = require('querystring')
  const generateQRCode = require('../utils/generate-qrcode')
  const readOTP = require('../utils/read-otp')

  const opts = getOptions(argv)

  if (opts.json || opts.parseable) {
    console.error(`Enabling two-factor authentication is an interactive operation and ${
      opts.json ? 'JSON' : 'parseable'
    } output mode is not available`)
    return
  }

  const validModes = ['auth-only', 'auth-and-writes']
  // Default value
  let tfaMode = argv.mode || 'auth-and-writes'

  if (!validModes.includes(tfaMode)) {
    const message = [
      `Invalid two factor authentication mode "${tfaMode}".`,
      'Valid modes are:',
      '\tauth-only - Require two-factor authentication only when logging in',
      '\tauth-and-writes - Require two-factor authentication when logging in AND when publishing'
    ]
    console.error(message.join('\n'))
    return
  }

  console.log(`Enabling two factor authentication for ${tfaMode}.`)

  const password = await readPassword()
  const profileInfo = await libnpm.profile.get(opts)

  // First, disable tfa if it is pending
  if (profileInfo.tfa && profileInfo.tfa.pending) {
    await otplease(opts, opts => libnpm.profile.set({
      tfa: {
        password,
        mode: 'disable'
      }
    }, opts))
  }

  // Set new 2fa mode
  const { tfa } = await otplease(opts, opts => libnpm.profile.set({
    tfa: {
      password,
      mode: tfaMode
    }
  }, opts))

  if (tfa) {
    // Now show the QR code
    const otpauth = url.parse(tfa)
    const otpQueryString = queryString.parse(otpauth.query)

    const QRCode = await generateQRCode(tfa)
    const QRMessage = [
      `Scan into you authenticator app:`,
      QRCode,
      `Or enter code: ${otpQueryString.secret}`
    ]
    console.log(QRMessage.join('\n'))

    // Tell the user to enter the OTP code
    const otp = await readOTP('Add and OTP code from your authenticator:')

    // And enable 2fa
    // It returns the recovery codes inside the tfa key
    const newProfileInfo = await libnpm.profile.set({ tfa: [otp] }, opts)

    if (newProfileInfo.tfa) {
      const succesfulMessage = [
        '2FA successfully enabled. Below are your recovery codes, please print these out.',
        'You will need these to recover access to your account if you lose your authentication device.'
      ]
      console.log(succesfulMessage.join('\n'))
      newProfileInfo.tfa.forEach(code => console.log(`\t${code}`))
    }
  } else {
    console.log(`Two factor authentication changed to: ${tfaMode}`)
  }
}

async function createToken (argv) {
  const opts = getOptions(argv)

  const password = await readPassword()

  // Check if OTP is required
  const newToken = await otplease(opts, opts => libnpm.profile.createToken(
    password,
    argv['read-only'],
    argv.cidr_whitelist,
    opts
  ))

  if (opts.json) {
    console.log(JSON.stringify(newToken, null, 2))
  } else if (opts.parseable) {
    console.log(tableHeaders.join('\t'))
    let values = tableHeaders
      .map(header => newToken[header])
      .reduce((previous, current) => `${previous}\t${current}`)
    console.log(values)
  } else if (!opts.silent && opts.loglevel !== 'silent') {
    const data = [mapTokenToTable(newToken, { trimToken: false })]
    console.log(renderToString(<Table data={data} />))
  }
}

async function removeToken (argv) {
  const opts = getOptions(argv)
  try {
    await libnpm.profile.removeToken(argv.token, opts)

    if (opts.json) {
      console.log(JSON.stringify({ token: argv.token, deleted: true }, null, 2))
    } else if (opts.parseable) {
      console.log(['token', 'deleted'].join('\t'))
      console.log([argv.token, true].join('\t'))
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      console.log('Token succesfully removed.')
    }
  } catch (e) {
    logError(e)
  }
}

async function listTokens (opts) {
  try {
    const tokens = await libnpm.profile.listTokens(opts)

    if (opts.json) {
      console.log(JSON.stringify(tokens, null, 2))
    } else if (opts.parseable) {
      console.log(tableHeaders.join('\t'))
      tokens.forEach(token => {
        let values = tableHeaders
          .map(header => token[header])
          .reduce((previous, current) => `${previous}\t${current}`)
        console.log(values)
      })
    } else if (!opts.silent && opts.loglevel !== 'silent') {
      const data = tokens.map(token => mapTokenToTable(token))
      console.log(renderToString(<Table data={data} />))
    }
  } catch (e) {
    logError(e)
  }
}
