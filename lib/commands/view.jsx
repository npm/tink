'use strict'

const npmlog = require('npmlog')

const libnpm = require('libnpm')
const npa = require('npm-package-arg')
const semver = require('semver')

const byteSize = require('byte-size')
const relativeDate = require('tiny-relative-date')

const { h, render, Fragment, Component, Color } = require('ink')

const View = module.exports = {
  command: 'view [<@scope>/]<pkg>[@<version>] [<field>[.<subfield>]...]',
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

  let { '@scope/pkg@version': spec, 'fieldsubfield': fields } = argv

  let packument = await libnpm.packument(spec || '.', { fullMetadata: true })
  let versions = Object.values(packument.versions)

  let { rawSpec } = npa(spec)
  let data = rawSpec
    ? versions.filter(({ version }) => semver.satisfies(version, rawSpec))
    : versions.slice(-1)

  data.forEach((version) => {
    version._time = packument.time[version.version]
    version._deps = version.dependencies && Object.keys(version.dependencies).length
    version._versions = versions.length
    version._bins = version.bin && Object.keys(version.bin)
    version['_dist-tags'] = packument['dist-tags']
  })

  display(data, fields, argv)
}

class Joined extends Component {
  render () {
    return h(
      Fragment,
      null,
      ...this.props.children.reduce((items, item) => {
        if (items.length) {
          items.push(this.props.delimiter)
        }
        items.push(item)
        return items
      }, [])
    )
  }
}

// lines *without* a trailing newline
class Lines extends Component {
  render () {
    return h(
      Fragment,
      null,
      ...this.props.children.reduce((lines, child) => {
        if (lines.length) {
          lines.push(h('br'))
        }
        lines.push(child)
        return lines
      }, [])
    )
  }
}

class PackageValueObject extends Component {
  render () {
    let { props: { field, value, props, maxItems = 6 } } = this
    let items = (props || Object.keys(value)).map((prop) => h(
      'span',
      null,
      ' ',
      prop,
      ': ',
      h(
        PackageValue,
        { field: `${field}.${prop}`, value: value[prop] }
      )
    ))

    if (!props && items.length > maxItems) {
      items = items.slice(0, --maxItems).concat(h(
        Color,
        { grey: true },
        `  (${items.length - maxItems} more...)`
      ))
    }

    return h(Lines, null, '', ...items)
  }
}

class PackageValueList extends Component {
  render () {
    let { props: { field, value } } = this

    if (typeof value[0] === 'string') {
      return h(Joined, { delimiter: ', ' }, value.map((item) =>
        h(Color, { yellow: true }, item)
      ))
    } else {
      let items = value.map((value, index) => h(
        'span',
        null,
        ' - ',
        h(
          PackageValue,
          { field: `${field}[${index}]`, value }
        )
      ))

      return h(Lines, null, '', ...items)
    }
  }
}

class PackageValueSpec extends Component {
  render () {
    let style = { greenBright: true, underline: true }
    let [, name, version] = this.props.spec.match(/^((?:@[\w-]+\/)?[\w-]+)@(.*)$/)
    return h(
      'span',
      null,
      h(Color, style, name),
      '@',
      h(Color, style, version)
    )
  }
}

class PackageValueUrl extends Component {
  render () {
    return h(Color, { cyan: true }, this.props.children[0])
  }
}

class PackageValuePerson extends Component {
  render () {
    let { props: { name, url, email } } = this
    let parts = []

    parts.push(h(Color, { yellow: true }, name))
    if (email) {
      parts.push(' <', h(PackageValueUrl, null, email), '>')
    }
    if (url) {
      parts.push(' (', h(PackageValueUrl, null, url), ')')
    }

    return h('span', null, ...parts)
  }
}

class PackageValueLicense extends Component {
  render () {
    let { value } = this.props
    let license = typeof value === 'string' ? value : (value.type || 'Proprietary')
    let style = license.toLowerCase() === 'proprietary' ? { redBright: true } : { green: true }

    return h(Color, style, license)
  }
}

class PackageValue extends Component {
  render () {
    let { field, value } = this.props

    if (value == null) {
      return h(Color, { grey: true }, value + '')

    // List
    } else if (Array.isArray(value)) {
      return h(PackageValueList, this.props)

    // Person
    } else if (field.startsWith('maintainers') || field === 'author' || field === '_npmUser') {
      return h(PackageValuePerson, value)

    // License
    } else if (field === 'license' || field === 'licence') {
      return h(PackageValueLicense, { value })

    // Object
    } else if (typeof value === 'object') {
      return h(PackageValueObject, this.props)

    // Date
    } else if (field === '_time') {
      return h(Color, { yellow: true }, relativeDate(value))

    // Size
    } else if (field.endsWith('unpackedSize')) {
      let size = byteSize(value)
      return h('span', null, h(Color, { yellow: true }, size.value), ' ', size.unit)

    // Version
    } else if (semver.validRange(value)) {
      return h(Color, { yellowBright: true }, value)

    // Url/Email
    } else if (['homepage', 'dist.tarball'].includes(field) || field.endsWith('.url') || field.endsWith('.email')) {
      return h(PackageValueUrl, null, value)

    // Spec
    } else if (field === '_id') {
      return h(PackageValueSpec, { spec: value })

    // Number
    } else if (!isNaN(parseInt(value))) {
      return h(Color, { yellow: true }, value.toString())

    // Else
    } else {
      return h(Color, { green: true }, JSON.stringify(value))
    }
  }
}
module.exports.PackageValue = PackageValue

class PackageField extends Component {
  render () {
    return h(
      Fragment,
      null,
      this.props.field.replace(/^_/, ''),
      ': ',
      h(PackageValue, this.props)
    )
  }
}
module.exports.PackageField = PackageField

class PackageFields extends Component {
  render () {
    let { props: { pkg, fields, prefixVersion, prefixField } } = this
    let prefix = prefixVersion ? `${pkg.name}@${pkg.version} ` : ''
    let lines = fields.map((field) => h(
      'span',
      null,
      prefixField ? `${prefix}${field} = ` : prefix,
      h(PackageValue, {
        field,
        value: resolveField(pkg, field)
      })
    ))

    return h('span', null, h(Lines, null, ...lines))
  }
}
module.exports.PackageFields = PackageFields

class PackageView extends Component {
  render () {
    let { pkg } = this.props

    const getProps = (field) => ({
      field,
      value: resolveField(pkg, field)
    })

    return h(
      'span',
      null,
      h(
        'div',
        null,
        h(PackageValue, getProps('_id')),
        ' | ',
        h(PackageValue, getProps('license')),
        ' | ',
        h(PackageField, getProps('_deps')),
        ' | ',
        h(PackageField, getProps('_versions'))
      ),
      pkg.description,
      h('br'),
      h('div', null, h(PackageValue, getProps('homepage'))),
      h('br'),
      h('div', null, h(PackageField, getProps('keywords'))),
      h('div', null, h(PackageField, getProps('_bins'))),
      h('br'),
      h('div', null, h(PackageField, {
        field: 'dist',
        value: pkg.dist,
        props: ['tarball', 'shasum', 'integrity', 'unpackedSize']
      })),
      h('br'),
      h('div', null, h(PackageField, getProps('dependencies'))),
      h('br'),
      h('div', null, h(PackageField, getProps('maintainers'))),
      h('br'),
      h('div', null, h(PackageField, getProps('_dist-tags'))),
      h('br'),
      h(Fragment, null, 'published ', h(PackageValue, getProps('_time')), ' by ', h(PackageValue, getProps('_npmUser')))
    )
  }
}
module.exports.PackageView = PackageView

function display (data, fields, argv) {
  let prefixVersion = fields.length && data.length > 1
  let prefixField = fields.length > 1

  if (argv.json) {
    if (fields.length) {
      data = data.map((pkg) => fields.reduce((object, field) => {
        object[field] = resolveField(pkg, field)
        return object
      }))
    }
    return console.log(JSON.stringify(
      prefixVersion
        ? data
        : prefixField
          ? data[0]
          : data[0][fields[0]],
      null,
      2
    ))
  }

  render(h(Lines, null, ...data.map((pkg) =>
    fields.length
      ? h(PackageFields, { pkg, fields, prefixVersion, prefixField })
      : h(PackageView, { pkg })
  )))()
}

function resolveField (data, field) {
  return field.replace(/[(.+?)]/g, '.$1').split('.').reduce(resolveProp, data)
}

function resolveProp (data, prop) {
  const numericProp = parseInt(prop)
  const isArrayIndex = !isNaN(numericProp) && isFinite(numericProp) && numericProp >= 0
  if (Array.isArray(data) && !isArrayIndex) {
    return data.map((data) => resolveProp(data, prop))
  } else if (data == null) {
    return undefined
  } else {
    return data[prop]
  }
}
