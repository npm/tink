'use strict'

const figures = require('figures')
const {
  h,
  Color,
  Component,
  Fragment,
  Text
} = require('ink')
const SelectInput = require('ink-select-input')
const TextInput = require('ink-text-input')
const libnpm = require('libnpm')

class Search extends Component {
  constructor (props) {
    super(props)
    const { terms } = this.props
    this.state = {
      isInstalling: false,
      isLoading: null,
      matches: [],
      selectedPackage: null,
      terms: terms || ''
    }
    this.onChangeTerms = this.onChangeTerms.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onSelectPackage = this.onSelectPackage.bind(this)
  }

  componentDidMount () {
    const { terms } = this.props
    if (terms) {
      this.search(terms)
    }
  }

  render () {
    const {
      isInstalling,
      isLoading,
      matches,
      selectedPackage,
      terms
    } = this.state

    return <div>
      <SearchInput
        terms={terms}
        onChange={this.onChangeTerms}
        onSubmit={this.onSubmit} />
      <SearchResults
        isLoading={isLoading}
        terms={terms}
        matches={matches}
        onSelect={this.onSelectPackage} />
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
        isLoading: true,
        matches: []
      })
      const matches = await libnpm.search(terms, {
        detailed: true,
        ...options
      })
      this.setState({
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

  onSubmit (terms) {
    this.search(terms)
  }

  onSelectPackage (pkg) {
    this.install(pkg)
  }
}

const SearchInput = ({ onChange, onSubmit, terms }) => {
  return <div>
    <Color grey bold>Find a package: </Color>
    <TextInput value={terms} onChange={onChange} onSubmit={onSubmit} />
  </div>
}

const SearchResults = ({ isLoading, matches, onSelect, terms }) => {
  if (isLoading) {
    return <div><Color green>Searching...</Color></div>
  }

  if (isLoading === false && terms && (!matches || !matches.length)) {
    return <Color grey>No matches found</Color>
  }

  if (isLoading === false && terms && matches && matches.length) {
    return <div>
      <Color grey bold>Results (maintenance, popularity, quality):</Color><br />
      <PackageSelector matches={matches} onSelect={onSelect} />
    </div>
  }

  return null
}

const PackageSelectIndicator = ({ isSelected }) => {
  if (!isSelected) {
    return ' ';
  }

  return <Color green>{ '> ' }</Color>
};

const formatPackageScore = num => `${ Math.round(num * 100) }%`

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

const PackageSelector = ({ matches, onSelect }) => {
  const items = matches.map(match => ({
    value: match,
    label: match
  }))

  return <SelectInput
    indicatorComponent={PackageSelectIndicator}
    items={items}
    itemComponent={PackageItem}
    onSelect={({ value }) => onSelect(value)} />
}

const InstallingPackage = ({ isInstalling, pkg }) => {
  if (!isInstalling) {
    return null
  }

  return <div><Color green>Installing {pkg.package.name}...</Color></div>
}

module.exports = Search
