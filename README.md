[![npm](https://img.shields.io/npm/v/tink.svg)](https://npm.im/tink) [![license](https://img.shields.io/npm/l/tink.svg)](https://npm.im/tink) [![Travis](https://img.shields.io/travis/npm/tink.svg)](https://travis-ci.org/npm/tink) [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/npm/tink?svg=true)](https://ci.appveyor.com/project/npm/tink) [![Coverage Status](https://coveralls.io/repos/github/npm/tink/badge.svg?branch=latest)](https://coveralls.io/github/npm/tink?branch=latest)

[`tink`](https://github.com/npm/tink) is an experimental package manager for
JavaScript. Don't expect to be able to use this with any of your existing
projects.

## Usage

`$ npx npm/tink`

## Table of Contents

* [Features](#features)
* [Contributing](#contributing)
* [API](#api)

### Features

* (mostly) npm-compatible project installation

### Contributing

The tink team enthusiastically welcomes contributions and project
participation! There's a bunch of things you can do if you want to contribute!
The [Contributor Guide](CONTRIBUTING.md) has all the information you need for
everything from reporting bugs to contributing entire new features. Please don't
hesitate to jump in if you'd like to, or even ask us questions if something
isn't clear.

### Acknowledgements

Big thanks to [Szymon Lisowiec](https://kysune.me/) for donating the `tink`
package name on npm! This package was previously an error logger helper tool,
but now it's a package manager runtime!

### TODO

* [x] lay out project
* [x] extract exploded pacote tarballs into cacache + build per-project index
* [x] do some basic benchmarks
* [x] write a node loader that can load a package through the file index
* [x] do some load time benchmarks
* [x] use `cache` from config, not from pkgmap (stop writing it there)
* [x] make pkgmap auto-fetch packages for missing hashes on the fly
* [x] add support for auth and .npmrc
* [ ] use spawn-wrap to support child_process calls
* [ ] warn if installing a package that requires run-scripts
* [ ] warn if installing something that requires bin/man linking
* [ ] add support for removing package tarballs from cache
* [ ] add fallback where "incompatible" packages get dumped into node_modules (and tagged a such in `package-map.json`)
* [ ] add support for node-gyp build caching to make native packages compatible
* [ ] add support for bin/man linking
* [ ] benchmark wubwub?
* [ ] write tests for fs overrides
* [ ] optimize fs and module load operations (need to analyze)
