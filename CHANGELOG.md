# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.9.4"></a>
## [0.9.4](https://github.com/npm/tink/compare/v0.9.3...v0.9.4) (2018-11-06)


### Bug Fixes

* **jsx:** pass transformed stuff to h() ([1eb2fbd](https://github.com/npm/tink/commit/1eb2fbd))



<a name="0.9.3"></a>
## [0.9.3](https://github.com/npm/tink/compare/v0.9.2...v0.9.3) (2018-11-06)


### Bug Fixes

* **cache:** fix --cache option to let it be provided in cli ([5ebf116](https://github.com/npm/tink/commit/5ebf116))



<a name="0.9.2"></a>
## [0.9.2](https://github.com/npm/tink/compare/v0.9.1...v0.9.2) (2018-11-06)


### Bug Fixes

* **perf:** improve require perf by speeding up resolver some more ([0876da7](https://github.com/npm/tink/commit/0876da7))
* **pkglock:** improve perf a bit by using cacache memoization ([c06ad62](https://github.com/npm/tink/commit/c06ad62))



<a name="0.9.1"></a>
## [0.9.1](https://github.com/npm/tink/compare/v0.9.0...v0.9.1) (2018-11-05)


### Bug Fixes

* **pkglock:** get require working again ([206b692](https://github.com/npm/tink/commit/206b692))
* **pkglock:** plug some infinite loops in require path ([dc96890](https://github.com/npm/tink/commit/dc96890))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/npm/tink/compare/v0.8.0...v0.9.0) (2018-11-05)


### Bug Fixes

* **cmd:** handle invalid subcmd case ([e1434e6](https://github.com/npm/tink/commit/e1434e6))


### Features

* **pkglock:** switch to loading deps off pkglock+cache ([5007c2c](https://github.com/npm/tink/commit/5007c2c))


### BREAKING CHANGES

* **pkglock:** this removes loading off package maps



<a name="0.8.0"></a>
# [0.8.0](https://github.com/npm/tink/compare/v0.7.3...v0.8.0) (2018-11-03)


### Features

* **cli:** recommend commands if none match ([f8cd9f0](https://github.com/npm/tink/commit/f8cd9f0))
* **cmd:** big refactor on cmd and opts stuff. ([0cf251f](https://github.com/npm/tink/commit/0cf251f))
* **prepare:** add a first draft of `tink prepare`. ([7046f50](https://github.com/npm/tink/commit/7046f50))



<a name="0.7.3"></a>
## [0.7.3](https://github.com/npm/tink/compare/v0.7.2...v0.7.3) (2018-11-03)


### Bug Fixes

* **release:** forgot to include bin dir ([84ef2eb](https://github.com/npm/tink/commit/84ef2eb))



<a name="0.7.2"></a>
## [0.7.2](https://github.com/npm/tink/compare/v0.7.1...v0.7.2) (2018-11-02)


### Bug Fixes

* **sh:** oops -- wrong argument count for script execution ([854a8f1](https://github.com/npm/tink/commit/854a8f1))



<a name="0.7.1"></a>
## [0.7.1](https://github.com/npm/tink/compare/v0.7.0...v0.7.1) (2018-11-02)


### Bug Fixes

* **sh:** allow CLI args to be passable down to tink sh-based bins ([9171514](https://github.com/npm/tink/commit/9171514))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/npm/tink/compare/v0.6.0...v0.7.0) (2018-11-02)


### Bug Fixes

* **config:** no longer need this hack ([c943f6c](https://github.com/npm/tink/commit/c943f6c))


### Features

* **cli:** add aliases for version and help ([d4f4b74](https://github.com/npm/tink/commit/d4f4b74))
* **cli:** enable completion script ([a80f318](https://github.com/npm/tink/commit/a80f318))
* **cli:** report unknown commands ([85cfb82](https://github.com/npm/tink/commit/85cfb82))
* **repl:** copy main repl from node for a nicer experience ([3104891](https://github.com/npm/tink/commit/3104891))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/npm/tink/compare/v0.5.0...v0.6.0) (2018-11-02)


### Bug Fixes

* **lint:** overrideAPI is no longer used ([0135065](https://github.com/npm/tink/commit/0135065))


### Features

* **cmd:** add ping command ([28c32b5](https://github.com/npm/tink/commit/28c32b5))
* **fs:** add create*Stream support ([b93ff78](https://github.com/npm/tink/commit/b93ff78))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/npm/tink/compare/v0.4.1...v0.5.0) (2018-11-02)


### Features

* **bin:** add separate `tish` bin ([1203e7e](https://github.com/npm/tink/commit/1203e7e))
* **fs:** add graceful-fs support, refactor, support writable open() ([07e097a](https://github.com/npm/tink/commit/07e097a))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/npm/tink/compare/v0.4.0...v0.4.1) (2018-11-02)


### Bug Fixes

* **installer:** remove spurious console.error ([c479980](https://github.com/npm/tink/commit/c479980))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/npm/tink/compare/v0.3.0...v0.4.0) (2018-11-02)


### Bug Fixes

* **config:** add dir and prepublish because npm-lifecycle needs them ([e43fdee](https://github.com/npm/tink/commit/e43fdee))
* **ensure-package:** tag native build scripts as install scripts too ([40f4e98](https://github.com/npm/tink/commit/40f4e98))
* **fs:** sometimes, we pick up graceful-fs by accident ([3d8d57a](https://github.com/npm/tink/commit/3d8d57a))
* **output:** handle installer errors and print them ([737769f](https://github.com/npm/tink/commit/737769f))


### Features

* **installer:** enable bin linking and script running ([dc1b403](https://github.com/npm/tink/commit/dc1b403))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/npm/tink/compare/v0.2.0...v0.3.0) (2018-11-01)


### Bug Fixes

* **docs:** badges were rendering horribly. ([950453c](https://github.com/npm/tink/commit/950453c))
* **lint:** get rid of unused lines ([95f42a3](https://github.com/npm/tink/commit/95f42a3))
* **lint:** standard --fix ([36db971](https://github.com/npm/tink/commit/36db971))
* **nodeArg:** pass in nodeArgs ([2b870e6](https://github.com/npm/tink/commit/2b870e6))


### Features

* **cmd:** use yargs for cmd management and regular opt parsing ([ca7fc3e](https://github.com/npm/tink/commit/ca7fc3e))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/npm/tink/compare/v0.1.0...v0.2.0) (2018-10-29)


### Features

* **pkgmap:** move package map up and override all `node_modules` dirs ([bde11a0](https://github.com/npm/tink/commit/bde11a0))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/npm/tink/compare/v0.0.2...v0.1.0) (2018-10-26)


### Bug Fixes

* **config:** prevent _cacache-chaining in config stuff ([4e89103](https://github.com/npm/tink/commit/4e89103))
* **ensure-package:** get webpack stuff working ([c6d551c](https://github.com/npm/tink/commit/c6d551c))
* **ensure-package:** stop monkey-patching. Leave it up to folks ([4df88b2](https://github.com/npm/tink/commit/4df88b2))
* **ensure-package:** warn on any errors ([f561cbb](https://github.com/npm/tink/commit/f561cbb))
* **pkgmap:** check that the value in the object is actually a string ([c134415](https://github.com/npm/tink/commit/c134415))
* **readdir:** get it working again ([146587a](https://github.com/npm/tink/commit/146587a))
* **test:** add resolvedPath to fix pkgmap tests ([2adbd1e](https://github.com/npm/tink/commit/2adbd1e))


### Features

* **fs:** add directory support to fs ops ([2d7bec4](https://github.com/npm/tink/commit/2d7bec4))
* **fs:** add fs.readdir* support ([042a1f8](https://github.com/npm/tink/commit/042a1f8))
* **pkgmap:** treat .package-map.json as a directory ([66c7f2e](https://github.com/npm/tink/commit/66c7f2e))
* **resolve:** be evil for a bit ([198a2ff](https://github.com/npm/tink/commit/198a2ff))
* **spawn:** add spawn-wrap for child process support ([6870716](https://github.com/npm/tink/commit/6870716))



<a name="0.0.2"></a>
## [0.0.2](https://github.com/npm/tink/compare/v0.0.1...v0.0.2) (2018-10-15)


### Bug Fixes

* **files:** add files array ([435366e](https://github.com/npm/tink/commit/435366e))



<a name="0.0.1"></a>
## 0.0.1 (2018-10-15)


### Bug Fixes

* **cache:** "tinkged-package" typo after the second great rename ([#5](https://github.com/npm/tink/issues/5)) ([ec3d4e2](https://github.com/npm/tink/commit/ec3d4e2))
* **checkPkgMap:** Fix lock file and map file validation   check ([2655711](https://github.com/npm/tink/commit/2655711))
* **compat:** check path.toNamespacedPath before call ([#6](https://github.com/npm/tink/issues/6)) ([3bc00f5](https://github.com/npm/tink/commit/3bc00f5))
* **config:** prevent default from overriding values ([8497384](https://github.com/npm/tink/commit/8497384))
* **fs:** make sure to handle other ENOENTs properly ([9923df4](https://github.com/npm/tink/commit/9923df4))
* **fs:** only fall back on null resolved ([b9753e0](https://github.com/npm/tink/commit/b9753e0))
* **fs:** uhhhh. try this other hack instead ([f996cce](https://github.com/npm/tink/commit/f996cce))
* **legal:** update LICENSE ([86bff42](https://github.com/npm/tink/commit/86bff42))
* **lint:** Remove unused util ([#7](https://github.com/npm/tink/issues/7)) ([2e49693](https://github.com/npm/tink/commit/2e49693))
* **main:** shuffle around index/bin/installer ([195b75c](https://github.com/npm/tink/commit/195b75c))
* **path_prefix:** fix the handling of path_prefix ([e9c9f83](https://github.com/npm/tink/commit/e9c9f83))
* **pkgmap:** add hacky support for scoped pkgs ([0394f0e](https://github.com/npm/tink/commit/0394f0e))
* **pkgmap:** fixed path prefix bit ([d1f3e54](https://github.com/npm/tink/commit/d1f3e54))
* **pkgmap:** perf fixed :D :D :D ([3052dbf](https://github.com/npm/tink/commit/3052dbf))
* **pkgmap:** refactor to make it a bit more readable ([deb0b19](https://github.com/npm/tink/commit/deb0b19))
* **stat:** have stat properly return false ([3c7cd8b](https://github.com/npm/tink/commit/3c7cd8b))
* **test:** get tests passing again ([b4ed34d](https://github.com/npm/tink/commit/b4ed34d))
* **test:** update pkgmap tests ([95e0f59](https://github.com/npm/tink/commit/95e0f59))


### Code Refactoring

* use async/await ([36bc210](https://github.com/npm/tink/commit/36bc210))


### Features

* **bin:** add a bin file for CLI usage ([9fc1c59](https://github.com/npm/tink/commit/9fc1c59))
* **cli:** got a baseline CLI working again ([09a157f](https://github.com/npm/tink/commit/09a157f))
* **config:** add currently-used config options ([9f825fc](https://github.com/npm/tink/commit/9f825fc))
* **config:** add new config parser that supports private packages ([2f1ad46](https://github.com/npm/tink/commit/2f1ad46))
* **config:** add support for loading configs from npm itself ([5b8fc0a](https://github.com/npm/tink/commit/5b8fc0a))
* **frog:** add base installer proof of concept ([91bebdb](https://github.com/npm/tink/commit/91bebdb))
* **fs:** add first draft of fs-overrider ([9cf0dde](https://github.com/npm/tink/commit/9cf0dde))
* **fs:** move fs into dir + mock up internal stat ([38c1114](https://github.com/npm/tink/commit/38c1114))
* **installer:** automatically run `npm install` if packages missing ([eda0157](https://github.com/npm/tink/commit/eda0157))
* **loader:** add TS and jsx support ([d6950a1](https://github.com/npm/tink/commit/d6950a1))
* **module:** support module loading from pkgmap ([68f098f](https://github.com/npm/tink/commit/68f098f))
* **node:** module for overriding all node bits ([7066961](https://github.com/npm/tink/commit/7066961))
* **pkgmap:** add mapped file resolve/read/stat support ([c511e17](https://github.com/npm/tink/commit/c511e17))
* **pkgmap:** add verify option to stat* ([261f6ec](https://github.com/npm/tink/commit/261f6ec))
* **pkgmap:** cache pkgmap parse failures too ([f9ba662](https://github.com/npm/tink/commit/f9ba662))
* **pkgmap:** cache pkgmaps even if missing ([3cfd0e6](https://github.com/npm/tink/commit/3cfd0e6))
* **pkgmap:** support prefixed OR unprefixed path_prefix ([2e1bccc](https://github.com/npm/tink/commit/2e1bccc))
* **restore:** automatically restore missing and broken files ([3d8ded8](https://github.com/npm/tink/commit/3d8ded8))


### BREAKING CHANGES

* no longer compatible with node@<8
