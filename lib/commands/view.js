'use strict'

const npmlog = require('npmlog')
const libnpm = require('libnpm')

const { h, renderToString } = require('ink')
const { PackageView, PackageFields } = require('../components/view.jsx')

const View = module.exports = {
  command: 'view [<pkg>[@<version>]] [<field>...]',
  aliases: ['v', 'info', 'show'],
  describe: 'Show information about a package',
  builder (yargs) {
    return yargs.help().alias('help', 'h').options(View.options)
  },
  options: Object.assign(require('../common-opts'), {}),
  handler: view
}

async function view (argv) {
  npmlog.heading = 'tink'

  let { 'pkg@version': spec, field: fields } = argv

  if (!spec) { spec = '.' }
  if (!fields) { fields = [] }

  const config = require('../config.js')
  const figgyPudding = require('figgy-pudding')

  const opts = figgyPudding(View.opts)(config(argv))

  let packument = await libnpm.packument(spec, opts.concat({
    fullMetadata: true,
    log: npmlog
  }))
  let { rawSpec } = libnpm.parseArg(spec)

  let options = {
    packument,
    fields,
    spec: rawSpec && rawSpec !== '.' ? rawSpec : null,
    json: argv.json
  }

  try {
    let view = h(
      fields.length ? PackageFields : PackageView,
      options
    )
    console.log(renderToString(view))
  } catch (e) {
    npmlog.error('view', e.message)
    npmlog.error('view', e.stack)
  }
}
