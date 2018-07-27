[![npm](https://img.shields.io/npm/v/frog.svg)](https://npm.im/frog) [![license](https://img.shields.io/npm/l/frog.svg)](https://npm.im/frog) [![Travis](https://img.shields.io/travis/npm/frog.svg)](https://travis-ci.org/npm/frog) [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/npm/frog?svg=true)](https://ci.appveyor.com/project/npm/frog) [![Coverage Status](https://coveralls.io/repos/github/npm/frog/badge.svg?branch=latest)](https://coveralls.io/github/npm/frog?branch=latest)

[`frog`](https://github.com/npm/frog) is an experimental package manager for
JavaScript. Don't expect to be able to use this with any of your existing
projects.

## Install

`$ npm install frog`

## Table of Contents

* [Features](#features)
* [Contributing](#contributing)
* [API](#api)

### Features

* (mostly) npm-compatible project installation

### Contributing

The frog team enthusiastically welcomes contributions and project
participation! There's a bunch of things you can do if you want to contribute!
The [Contributor Guide](CONTRIBUTING.md) has all the information you need for
everything from reporting bugs to contributing entire new features. Please don't
hesitate to jump in if you'd like to, or even ask us questions if something
isn't clear.

### TODO

* [x] lay out project
* [ ] extract exploded pacote tarballs into cacache + build per-project index
* [ ] crash if installing a package that requires run-scripts
* [ ] do some basic benchmarks
* [ ] warn if installing something that requires bin/man linking
* [ ] write a node loader that can load a package through the file index
* [ ] do some load time benchmarks
* [ ] add support for removing package tarballs from cache
* [ ] add fallback where "incompatible" packages get dumped into node_modules
* [ ] add support for node-gyp build caching to make native packages compatible
* [ ] add support for bin/man linking
* [ ] rewrite some __dirname/__filename expressions to make them compatible
* [ ] benchmark wubwub?
