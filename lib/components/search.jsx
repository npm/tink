'use strict'

const {
  h,
  Color,
  Component,
  Fragment,
  Text
} = require('ink')
const SelectInput = require('ink-select-input')
const Spinner = require('ink-spinner')
const TextInput = require('ink-text-input')
const libnpm = require('libnpm')


const MAX_RESULTS = 10


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
      this.search()
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

  search (terms) {
    return libnpm.search(terms, {
      limit: MAX_RESULTS
    })
  }

  install (pkg) {
    // @todo Implement real install
    return new Promise((resolve, reject) => setTimeout(resolve, 1000))
  }

  onChangeTerms (terms) {
    this.setState({ terms })
  }

  async onSubmit (terms) {
    try {
      this.setState({
        isLoading: true,
        matches: []
      })
      const matches = await this.search(this.state.terms)
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

  async onSelectPackage (option) {
    const { value: pkg } = option

    try {
      this.setState({
        isInstalling: true,
        selectedPackage: pkg
      })
      await this.install(pkg)
      this.setState({ isInstalling: false })
      this.props.onExit()
    } catch (err) {
      // @todo Show error message
      this.setState({ isInstalling: false })
    }
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
    return <div><Spinner /> <Color green>Searching...</Color></div>
  }

  if (isLoading === false && terms && (!matches || !matches.length)) {
    return <Color grey>No matches found</Color>
  }

  if (isLoading === false && terms && matches && matches.length) {
    return <div>
      <Color grey bold>Results:</Color><br />
      <PackageSelector matches={matches} onSelect={onSelect} />
    </div>
  }

  return null
}

const PackageSelector = ({ matches, onSelect }) => {
  const items = matches.map(match => ({
    value: match,
    label: match.name
  }))

  return <SelectInput items={items} onSelect={onSelect} />
}

const InstallingPackage = ({ isInstalling, pkg }) => {
  if (!isInstalling) {
    return null
  }

  return <div><Spinner /> <Color green>Installing {pkg.name}...</Color></div>
}

module.exports = {
  Search
}
