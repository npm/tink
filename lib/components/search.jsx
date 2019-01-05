'use strict'

const {
  h, // eslint-disable-line no-unused-vars
  Color,
  Component,
  Fragment
} = require('ink')
const SelectInput = require('ink-select-input')
const TextInput = require('ink-text-input')
const libnpm = require('libnpm')

const FOCUS_SEARCH = 'FOCUS_SEARCH'
const FOCUS_RESULTS = 'FOCUS_RESULTS'

class Search extends Component {
  constructor (props) {
    super(props)
    const { terms } = this.props
    this.state = {
      isInstalling: false,
      isLoading: null,
      focusedOn: FOCUS_SEARCH,
      matches: [],
      selectedPackage: null,
      terms: terms || ''
    }

    this.onChangeTerms = this.onChangeTerms.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onSelectPackage = this.onSelectPackage.bind(this)
  }

  componentDidMount () {
    const { terms } = this.props
    process.stdin.on('keypress', this.onKeyPress)

    if (terms) {
      this.search(terms)
    }
  }

  componentWillUnmount () {
    process.stdin.removeListener('keypress', this.onKeyPress)
  }

  render () {
    const {
      focusedOn,
      isInstalling,
      isLoading,
      matches,
      selectedPackage,
      terms
    } = this.state

    return <div>
      { !isInstalling && <Fragment>
        <SearchInput
          isFocused={focusedOn === FOCUS_SEARCH}
          terms={terms}
          onChange={this.onChangeTerms}
          onSubmit={this.onSubmit} />
        <SearchResults
          isFocused={focusedOn === FOCUS_RESULTS}
          isLoading={isLoading}
          terms={terms}
          matches={matches}
          onSelect={this.onSelectPackage} />
      </Fragment> }
      { isInstalling && selectedPackage
        ? <InstallingPackage isInstalling={isInstalling} pkg={selectedPackage} />
        : null
      }
    </div>
  }

  async search (terms) {
    const { options } = this.props
    try {
      this.setState({
        focusedOn: FOCUS_SEARCH,
        isLoading: true,
        matches: []
      })
      const matches = await libnpm.search(terms, {
        detailed: true,
        ...options
      })
      this.setState({
        focusedOn: matches && matches.length ? FOCUS_RESULTS : FOCUS_SEARCH,
        isLoading: false,
        matches
      })
    } catch (err) {
      // @todo Show error message
      this.setState({
        isLoading: false,
        matches: []
      })
    }
  }

  async install (pkg) {
    try {
      this.setState({
        isInstalling: true,
        selectedPackage: pkg
      })
      // @todo Implement real install
      await new Promise((resolve, reject) => setTimeout(resolve, 1000))
      this.setState({ isInstalling: false })
      this.props.onExit()
    } catch (err) {
      // @todo Show error message
      this.setState({ isInstalling: false })
    }
  }

  onChangeTerms (terms) {
    this.setState({ terms })
  }

  onKeyPress (chunk, key) {
    const {
      focusedOn,
      matches,
      selectedPackage
    } = this.state

    // If up/down arrows are pressed, make sure we're focused on search results

    if (['up', 'down'].includes(key.name)) {
      if (focusedOn !== FOCUS_RESULTS && matches && matches.length) {
        return this.setState({ focusedOn: FOCUS_RESULTS })
      }
      return
    }

    // If enter is pressed and we're focused on search results, install

    if (key.name === 'enter' && focusedOn === FOCUS_RESULTS && selectedPackage) {
      return this.install(selectedPackage)
    }

    // If non up/down/enter keys were pressed and we're not focused on search
    // input, focus on search input

    if (focusedOn !== FOCUS_SEARCH) {
      return this.setState({ focusedOn: FOCUS_SEARCH })
    }
  }

  onSubmit (terms) {
    this.search(terms)
  }

  onSelectPackage (pkg) {
    this.install(pkg)
  }
}

const SearchInput = ({ isFocused, onChange, onSubmit, terms }) => {
  return <div>
    <Color grey bold>Find a package: </Color>
    <TextInput focused={isFocused} value={terms} onChange={onChange} onSubmit={onSubmit} />
  </div>
}

const SearchResults = ({ isFocused, isLoading, matches, onSelect, terms }) => {
  if (isLoading) {
    return <div><Color green>Searching...</Color></div>
  }

  if (isLoading === false && terms && (!matches || !matches.length)) {
    return <Color grey>No matches found</Color>
  }

  if (isLoading === false && matches && matches.length) {
    return <div>
      <Color grey bold>Results (maintenance, popularity, quality):</Color><br />
      <PackageSelector isFocused={isFocused} matches={matches} onSelect={onSelect} />
    </div>
  }

  return null
}

const PackageSelectIndicator = ({ isSelected }) => {
  if (!isSelected) {
    return ' '
  }

  return <Color green>{ '> ' }</Color>
}

const formatPackageScore = num => `${Math.round(num * 100)}%`

const PackageItem = ({ isSelected, value }) => {
  const {
    package: {
      name,
      publisher: { username }
    },
    score: {
      detail: {
        maintenance,
        popularity,
        quality
      }
    }
  } = value

  const m = formatPackageScore(maintenance)
  const p = formatPackageScore(popularity)
  const q = formatPackageScore(quality)

  return <Color green={isSelected}>{name} @{username} ({m} / {p} / {q})</Color>
}

const PackageSelector = ({ isFocused, matches, onSelect }) => {
  const items = matches.map(match => ({
    value: match,
    label: match
  }))

  if (isFocused) {
    return <SelectInput
      indicatorComponent={PackageSelectIndicator}
      items={items}
      itemComponent={PackageItem}
      onSelect={({ value }) => onSelect(value)} />
  } else if (items && items.length) {
    return items.map(({ value }) => <div>{ ' ' }<PackageItem value={value} /></div>)
  }
}

const InstallingPackage = ({ isInstalling, pkg }) => {
  if (!isInstalling) {
    return null
  }

  return <div><Color green>Installing {pkg.package.name}...</Color></div>
}

module.exports = Search
