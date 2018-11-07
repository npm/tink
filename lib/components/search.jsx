'use strict'

const libnpm = require('libnpm')
const {
  h,
  Color,
  Component,
  Fragment,
  Text
} = require('ink')
const SelectInput = require('ink-select-input')
const TextInput = require('ink-text-input')

const MAX_RESULTS = 10

class Search extends Component {
  constructor (props) {
    super(props)
    const { terms } = this.props
    this.state = {
      isLoading: false,
      matches: [],
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
      isLoading,
      matches,
      terms
    } = this.state

    return <Fragment>
      <SearchInput
        terms={terms}
        onChange={this.onChangeTerms}
        onSubmit={this.onSubmit} />
      <SearchResults
        isLoading={isLoading}
        terms={terms}
        matches={matches}
        onSelect={this.onSelectPackage} />
    </Fragment>
  }

  async search () {
    try {
      this.setState({
        isLoading: true,
        matches: []
      })
      const { terms } = this.state
      const matches = await libnpm.search(terms, {
        limit: MAX_RESULTS
      })
      this.setState({
        isLoading: false,
        matches
      })
    } catch (err) {
      // @todo
      console.error('Error', err)
      this.setState({
        isLoading: false,
        matches: []
      })
    }
  }

  onChangeTerms (terms) {
    this.setState({ terms })
  }

  onSubmit (terms) {
    this.search()
  }

  onSelectPackage (pkg) {
    console.log('onSelectPackage')
  }
}

const SearchInput = ({ terms, onChange, onSubmit }) => {
  return <div>
    <Color grey bold>Find a package: </Color>
    <TextInput value={terms} onChange={onChange} onSubmit={onSubmit} />
  </div>
}

const SearchResults = ({ isLoading, terms, matches, onSelect }) => {
  if (!terms) {
    return null
  }

  if (isLoading) {
    return <Color grey>...</Color>
  }

  if (!matches || !matches.length) {
    return <Color grey>No matches found</Color>
  }

  return <div>
    <Color grey bold>Results:</Color><br />
    <PackageSelector matches={matches} onSelect={onSelect} />
  </div>
}

const PackageSelector = ({ matches, onSelect }) => {
  const items = matches.map(match => ({
    value: match,
    label: match.name
  }))

  return <SelectInput items={items} onSelect={onSelect} />
}

module.exports = {
  Search
}
