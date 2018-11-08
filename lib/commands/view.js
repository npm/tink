'use strict'

const npmlog = require('npmlog')
const libnpm = require('libnpm')
const npa = require('npm-package-arg')

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

  let packument = await libnpm.packument(spec, Object.assign({}, argv, {
    fullMetadata: true,
    log: npmlog
  }))
  let { rawSpec } = npa(spec)

  let options = {
    packument,
    fields,
    spec: rawSpec === '.' ? null : rawSpec,
    json: argv.json
  }

  try {
    let view = h(
      fields.length ? PackageFields : PackageView,
      options
    )
    console.log(renderToString(view))
  } catch ({message}) {
    npmlog.error('view', message)
  }
}
