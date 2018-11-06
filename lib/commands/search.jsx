'use strict'

const { h, render } = require('ink')
const libnpm = require('libnpm')
const { Search } = require('../components/search.jsx')

const SearchCommand = module.exports = {
  command: 'search',
  aliases: ['s', 'se', 'find'],
  describe: 'Search the NPM registry',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(SearchCommand.options)
  },
  options: Object.assign(require('../common-opts.js'), {}),
  handler: search
}

// One arg: search, no args: interactive

async function search (argv) {
  let unmount

  const onError = () => {
    unmount()
    process.exit(1)
  }

  const onExit = () => {
    unmount()
    process.exit()
  }

  const [cmd, terms] = argv._

  unmount = render(h(Search, {
    onError,
    onExit,
    terms
  }))
}
