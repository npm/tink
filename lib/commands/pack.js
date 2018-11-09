'use strict'

const pacote = require('pacote')
const deprCheck = require('../utils/depr-check')

const Pack = module.exports = {
  command: 'pack [spec...]',
  describe: 'collect the current package into tarball',
  handler: async (argv) => pack(argv)
}

async function pack (argv) {
  if (!argv.spec || argv.spec.length === 0) {
    argv.spec = ['.']
  }

  argv.spec.map(spec => _pack(spec))
}

function _pack (spec) {
  pacote.manifest(spec)
    .then(pkg => {
      deprCheck(pkg)
      let name = pkg.name[0] === '@'
        ? pkg.name.substr(1).replace(/\//g, '-')
        : pkg.name
      let target = `${name}-${pkg.version}.tgz`
      return pacote.tarball.toFile(spec, target)
        .then(() => console.log('written'))
    })
}
