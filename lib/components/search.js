'use strict'

const libnpm = require('libnpm')
const { h, Color, Component } = require('ink')

class Search extends Component {
  render () {
    const { terms } = this.props

    return h(
      Color,
      { grey: true },
      'Hello'
    )
  }
}

class SearchInput extends Component {
  render () {
    
  }
}

class SearchResults extends Component {

}

module.exports = {
  Search
}
