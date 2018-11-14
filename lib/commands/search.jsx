'use strict'

const { h, render } = require('ink')
const Search = require('../components/search.jsx')

const DEFAULT_LIMIT = 10

const SearchCommand = module.exports = {
  command: 'search',
  aliases: ['s', 'se', 'find'],
  describe: 'Search the NPM registry',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(SearchCommand.options)
  },
  options: {
    limit: {
      alias: 'l',
      default: DEFAULT_LIMIT,
      description: 'Number of results to limit the query to',
      type: 'number'
    },
    maintenance: {
      alias: 'm',
      description: 'Decimal number between `0` and `1` that defines the weight of `maintenance` metrics when scoring and sorting packages',
      type: 'number'
    },
    offset: {
      alias: 'o',
      description: 'Offset number for results. Used with `--limit` for pagination',
      type: 'number'
    },
    popularity: {
      alias: 'p',
      description: 'Decimal number between `0` and `1` that defines the weight of `popularity` metrics when scoring and sorting packages',
      type: 'number'
    },
    quality: {
      alias: 'q',
      description: 'Decimal number between `0` and `1` that defines the weight of `quality` metrics when scoring and sorting packages',
      type: 'number'
    },
    sortBy: {
      alias: 's',
      choices: [
        'maintenance',
        'optimal',
        'popularity',
        'quality'
      ],
      description: 'Used as a shorthand to set `--quality`, `--maintenance`, and `--popularity` with values that prioritize each one'
    }
  },
  handler: search
}

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
  console.log('argv', argv)
  const [cmd, terms] = argv._

  unmount = render(<Search
    onError={onError}
    onExit={onExit}
    options={argv}
    terms={terms} />)
}
