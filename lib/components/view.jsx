const semver = require('semver')
const byteSize = require('byte-size')
const relativeDate = require('tiny-relative-date')
const columns = require('cli-columns')

const {
  h, // eslint-disable-line
  renderToString,
  Fragment,
  Component,
  Color,
  Indent
} = require('ink')
const Box = require('ink-box')

const MAX_ITEMS = 6
const ROW_WIDTH = 4

class Joined extends Component {
  render () {
    return <Fragment>
      {this.props.children.reduce((items, item) => {
        if (items.length) {
          items.push(this.props.delimiter)
        }
        items.push(item)
        return items
      }, [])}
    </Fragment>
  }
}

// lines *without* a trailing newline
class Lines extends Component {
  render () {
    return <Joined delimiter={<br />}>
      {this.props.children}
    </Joined>
  }
}

class Columns extends Component {
  render () {
    return columns(this.props.children.map(renderToString), {
      sort: false
    })
  }
}

const packageValueObjectItems = function ({ field, value, props, maxItems }) {
  if (!maxItems) maxItems = MAX_ITEMS
  let items = (props || Object.keys(value))

  if (!items.length) {
    return <Color grey>(empty)</Color>
  }

  items = items.map((prop) =>
    <span>
      {prop}: <PackageValue field={`${field}.${prop}`} value={value[prop]} />
    </span>
  )

  if (!props && items.length > maxItems) {
    items = items.slice(0, --maxItems).concat(
      <Color grey>
        ({items.length - maxItems} more...)
      </Color>
    )
  }

  return items
}

class PackageValueObject extends Component {
  render () {
    return <Fragment>
      <br />
      <Indent size={2}>
        <Lines>
          {packageValueObjectItems(this.props)}
        </Lines>
      </Indent>
    </Fragment>
  }
}

class PackageValueList extends Component {
  render () {
    let { field, value } = this.props

    if (value.length === 0) {
      return <Color grey>(empty)</Color>
    } else if (value.every((item) => typeof item === 'string')) {
      return <Joined delimiter=', '>
        {value.map((item) => <Color yellow>{item}</Color>)}
      </Joined>
    } else {
      let items = value.map((value, index) =>
        <span>
          - <PackageValue field={`${field}[${index}]`} value={value} />
        </span>
      )

      return <Fragment>
        <br />
        <Indent size={2}>
          <Lines>{items}</Lines>
        </Indent>
      </Fragment>
    }
  }
}

class PackageValueSpec extends Component {
  render () {
    let [, name, version] = this.props.value.match(/^((?:@[\w-]+\/)?[\w-]+)@(.*)$/)
    return <span>
      <Color greenBright underline>{name}</Color>
      @
      <Color greenBright underline>{version}</Color>
    </span>
  }
}

class PackageValueUrl extends Component {
  render () {
    return <Color cyan>
      {this.props.value}
    </Color>
  }
}

class PackageValuePerson extends Component {
  render () {
    let { name, url, email } = this.props
    let parts = []

    if (email) {
      parts.push(' <', <PackageValueUrl value={email} />, '>')
    }
    if (url) {
      parts.push(' (', <PackageValueUrl value={url} />, ')')
    }

    return <span>
      <Color yellow>{name}</Color>
      {parts}
    </span>
  }
}

class PackageValueLicense extends Component {
  render () {
    let { value } = this.props
    let license = typeof value === 'string' ? value : (value.type || 'Proprietary')
    let style = license.toLowerCase() === 'proprietary' ? { redBright: true } : { green: true }

    return <Color {...style}>{license}</Color>
  }
}

class PackageValueDeps extends Component {
  render () {
    let items = packageValueObjectItems({
      field: this.props.field,
      value: this.props.value,
      maxItems: (this.props.maxItems || MAX_ITEMS) * ROW_WIDTH
    })

    return <Fragment>
      <br />
      <Indent size={2}>
        <Columns>{items}</Columns>
      </Indent>
    </Fragment>
  }
}

class PackageValue extends Component {
  render () {
    let { field, value } = this.props

    if (value == null) {
      return <Color grey>{value + ''}</Color>

    // List
    } else if (Array.isArray(value)) {
      return <PackageValueList {...this.props} />

    // Dependencies
    } else if (/[Dd]ependencies$/.test(field)) {
      return <PackageValueDeps {...this.props} />

    // Person
    } else if (field.startsWith('maintainers') || field === 'author' || field === '_npmUser') {
      return <PackageValuePerson {...value} />

    // License
    } else if (field === 'license' || field === 'licence') {
      return <PackageValueLicense value={value} />

    // Object
    } else if (typeof value === 'object') {
      return <PackageValueObject {...this.props} />

    // Date
    } else if (field === '_time') {
      return <Color yellow>{relativeDate(value)}</Color>

    // Size
    } else if (field.endsWith('unpackedSize')) {
      let size = byteSize(value)
      return <span>
        <Color yellow>{size.value}</Color> {size.unit}
      </span>

    // Version
    } else if (semver.validRange(value)) {
      return <Color yellowBright>{value}</Color>

    // Url/Email
    } else if (['homepage', 'dist.tarball'].includes(field) || field.endsWith('.url') || field.endsWith('.email')) {
      return <PackageValueUrl value={value} />

    // Spec
    } else if (field === '_id') {
      return <PackageValueSpec value={value} />

    // Number
    } else if (!isNaN(parseInt(value))) {
      return <Color yellow>{value.toString()}</Color>

    // Else
    } else {
      return <Color green>{JSON.stringify(value)}</Color>
    }
  }
}
module.exports.PackageValue = PackageValue

class PackageField extends Component {
  render () {
    return <Fragment>
      {this.props.field.replace(/^_/, '')}: <PackageValue {...this.props} />
    </Fragment>
  }
}
module.exports.PackageField = PackageField

class PackageFields extends Component {
  render () {
    let { packument, spec, json, fields } = this.props
    let [data, versions] = getData(packument, spec, fields)

    if (json) {
      return <div>
        {JSON.stringify(
          data.length > 1 ? data : data[0],
          null,
          2
        )}
      </div>
    }

    let views = data.map((pkg, index) => {
      let prefix = data.length > 1 ? `${packument.name}@${versions[index]} ` : ''

      let lines = fields.map((field) =>
        <span>
          {prefix}
          <PackageField field={field} value={(pkg && pkg[field]) || pkg} maxItems={Infinity} />
        </span>
      )

      return <span>
        <Lines>{lines}</Lines>
      </span>
    })

    return <Lines>{views}</Lines>
  }
}
module.exports.PackageFields = PackageFields

class PackageSummary extends Component {
  render () {
    let { packument, spec, json } = this.props
    let [data] = getData(packument, spec)
    let views = data.map((pkg) => {
      const getProps = (field) => ({
        field,
        value: resolveField(pkg, field)
      })

      return <Box>
        <div>
          <PackageValue {...getProps('_id')} />
          <span> | </span>
          <PackageValue {...getProps('license')} />
          <span> | </span>
          <PackageField field='_deps' value={Object.keys(pkg.dependencies || {}).length} />
          <span> | </span>
          <span>
            <span>published </span>
            <PackageValue field='_time' value={packument.time[pkg.version]} />
            <span> by </span>
            <PackageValue {...getProps('_npmUser')} />
          </span>
        </div>

        <div>{pkg.description}</div>
        <span><PackageValue {...getProps('homepage')} /> - <PackageValue {...getProps('keywords')} /></span>
      </Box>
    })

    return <Joined
      delimiter={[<br />, <br />]}>
      {views}
    </Joined>
  }
}
module.exports.PackageSummary = PackageSummary

class PackageView extends Component {
  render () {
    let { packument, spec, json } = this.props
    let [data] = getData(packument, spec)

    if (json) {
      return <div>
        {JSON.stringify(data.length > 1 ? data : data[0], null, 2)}
      </div>
    }

    let views = data.map((pkg) => {
      const getProps = (field) => ({
        field,
        value: resolveField(pkg, field)
      })

      return <span>
        <div>
          <PackageValue {...getProps('_id')} />
          <span> | </span>
          <PackageValue {...getProps('license')} />
          <span> | </span>
          <PackageField field='_deps' value={Object.keys(pkg.dependencies || {}).length} />
          <span> | </span>
          <PackageField field='_versions' value={Object.keys(packument.versions).length} />
        </div>

        <div>{pkg.description}</div>
        <div><PackageValue {...getProps('homepage')} /></div>
        <br />

        <div><PackageField {...getProps('keywords')} /></div>
        <div><PackageField field='_bins' value={Object.keys(pkg.bin || {})} /></div>
        <br />

        <div>
          <PackageField
            {...getProps('dist')}
            props={['tarball', 'shasum', 'integrity', 'unpackedSize']} />
        </div>
        <br />

        <div><PackageField {...getProps('dependencies')} /></div>
        <br />

        <div><PackageField {...getProps('maintainers')} /></div>
        <br />

        <div><PackageField field='_dist-tags' value={packument['dist-tags']} /></div>
        <br />

        <span>
          <span>published </span>
          <PackageValue field='_time' value={packument.time[pkg.version]} />
          <span> by </span>
          <PackageValue {...getProps('_npmUser')} />
        </span>
      </span>
    })

    return <Joined
      delimiter={[<br />, <br />]}>
      {views}
    </Joined>
  }
}
module.exports.PackageView = PackageView

function getData (packument, spec, fields) {
  let data = Object.values(packument.versions)
  // filter by spec
  data = semver.validRange(spec)
    ? data.filter(({ version }) => semver.satisfies(version, spec))
    : [data.find(({ version }) => version === packument['dist-tags'][spec || 'latest'])]

  if (data.length === 0 || data[0] == null) {
    throw new Error(`No versions matching "${spec || 'latest'}"`)
  }

  let versions = data.map(({ version }) => version)

  // add general info
  data = data.map((pkg) => Object.assign({}, packument, pkg, {
    versions: Object.keys(packument.versions)
  }))

  // filter by field
  if (Array.isArray(fields)) {
    if (fields.length === 1) {
      data = data.map((pkg) => resolveField(pkg, fields[0]))
    } else {
      data = data.map((pkg) => fields.reduce((object, field) => {
        object[field] = resolveField(pkg, field)
        return object
      }, {}))
    }
  }

  return [data, versions]
}

function resolveField (data, field) {
  return field
    //      '[foo]'  'foo' OR '.foo'
    //         |           |
    //      /-----\ /-------------\
    .match(/\[.+?\]|.+?(?=[.[\]]|$)/g)
    .map((prop) => prop.replace(/^[.[]|[\]]$/g, ''))
    .reduce(resolveProp, data)
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
