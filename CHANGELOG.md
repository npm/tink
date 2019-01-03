# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.19.8"></a>
## [0.19.8](https://github.com/npm/tink/compare/v0.19.7...v0.19.8) (2019-01-03)


### Bug Fixes

* **esm:** downgrade esm for now ([ad26a10](https://github.com/npm/tink/commit/ad26a10))



<a name="0.19.7"></a>
## [0.19.7](https://github.com/npm/tink/compare/v0.19.6...v0.19.7) (2019-01-03)


### Bug Fixes

* **esm:** try the non-bundled esm ([5f7abf3](https://github.com/npm/tink/commit/5f7abf3))



<a name="0.19.6"></a>
## [0.19.6](https://github.com/npm/tink/compare/v0.19.5...v0.19.6) (2019-01-03)


### Bug Fixes

* **fs:** try to hunt down cachePath issue ([d5745b8](https://github.com/npm/tink/commit/d5745b8))



<a name="0.19.5"></a>
## [0.19.5](https://github.com/npm/tink/compare/v0.19.4...v0.19.5) (2019-01-03)


### Bug Fixes

* **fs:** require fs before esm ([6efc3fe](https://github.com/npm/tink/commit/6efc3fe))



<a name="0.19.4"></a>
## [0.19.4](https://github.com/npm/tink/compare/v0.19.3...v0.19.4) (2019-01-03)


### Bug Fixes

* **deps:** remove unused or redundant deps and update babel deps ([aeee9a3](https://github.com/npm/tink/commit/aeee9a3))



<a name="0.19.3"></a>
## [0.19.3](https://github.com/npm/tink/compare/v0.19.2...v0.19.3) (2019-01-02)



<a name="0.19.2"></a>
## [0.19.2](https://github.com/npm/tink/compare/v0.19.1...v0.19.2) (2019-01-02)


### Bug Fixes

* **babel:** switch to esm from repo and fix babel usage ([a6daeb1](https://github.com/npm/tink/commit/a6daeb1))
* **jsx,ts:** use babel for transforming ([16d03a8](https://github.com/npm/tink/commit/16d03a8))
* **shell:** stop throwing away errors ([1b507e8](https://github.com/npm/tink/commit/1b507e8))



<a name="0.19.1"></a>
## [0.19.1](https://github.com/npm/tink/compare/v0.19.0...v0.19.1) (2019-01-02)


### Performance Improvements

* **sh:** load main module in-process when possible ([5e9e352](https://github.com/npm/tink/commit/5e9e352))



<a name="0.19.0"></a>
# [0.19.0](https://github.com/npm/tink/compare/v0.18.0...v0.19.0) (2019-01-01)


### Features

* **esm:** adding baseline ESM load support ([d58d636](https://github.com/npm/tink/commit/d58d636))



<a name="0.18.0"></a>
# [0.18.0](https://github.com/npm/tink/compare/v0.17.3...v0.18.0) (2018-12-19)


### Bug Fixes

* **sh:** make sure to load fs patches too ([0117dbe](https://github.com/npm/tink/commit/0117dbe))


### Features

* **prepare:** support install scripts and native builds ([11fc0d6](https://github.com/npm/tink/commit/11fc0d6))



<a name="0.17.3"></a>
## [0.17.3](https://github.com/npm/tink/compare/v0.17.2...v0.17.3) (2018-12-03)


### Bug Fixes

* **add:** ugh ([1cc5ad0](https://github.com/npm/tink/commit/1cc5ad0))
* **fs:** make open override do a two-step copy for now ([2e3780f](https://github.com/npm/tink/commit/2e3780f))
* **installer:** load node patches earlier ([6f28969](https://github.com/npm/tink/commit/6f28969))
* **pkglock:** fix arguments to prepare in lock worker ([65b657c](https://github.com/npm/tink/commit/65b657c))
* **shell:** use argv._ now ([68e301d](https://github.com/npm/tink/commit/68e301d))



<a name="0.17.2"></a>
## [0.17.2](https://github.com/npm/tink/compare/v0.17.1...v0.17.2) (2018-12-01)


### Bug Fixes

* **access:** fix config/log stuff ([109a5fe](https://github.com/npm/tink/commit/109a5fe))
* **add:** fix up config stuff ([10ad858](https://github.com/npm/tink/commit/10ad858))
* **build:** fix up config stuff ([11dec66](https://github.com/npm/tink/commit/11dec66))
* **config:** already giving it a log object. ([52fb92c](https://github.com/npm/tink/commit/52fb92c))
* **deprecate:** fix up config stuff ([fcfd40d](https://github.com/npm/tink/commit/fcfd40d))
* **org:** fix up config stuff ([c56d336](https://github.com/npm/tink/commit/c56d336))
* **ping:** improve the overall command a bit ([9b18a86](https://github.com/npm/tink/commit/9b18a86))
* **profile:** fix up config stuff ([43f8356](https://github.com/npm/tink/commit/43f8356))
* **rm:** fix up config stuff ([69312aa](https://github.com/npm/tink/commit/69312aa))
* **team:** fix up config stuff ([9917fe5](https://github.com/npm/tink/commit/9917fe5))
* **whoami:** fix up config stuff ([adb31e4](https://github.com/npm/tink/commit/adb31e4))



<a name="0.17.1"></a>
## [0.17.1](https://github.com/npm/tink/compare/v0.17.0...v0.17.1) (2018-11-26)


### Bug Fixes

* **lint:** standard --fix ([a260db1](https://github.com/npm/tink/commit/a260db1))
* **production:** fix up the config stuff after adding --prod ([8a6e295](https://github.com/npm/tink/commit/8a6e295))



<a name="0.17.0"></a>
# [0.17.0](https://github.com/npm/tink/compare/v0.16.0...v0.17.0) (2018-11-21)


### Bug Fixes

* **log:** get logging config to propagate correctly ([40b1333](https://github.com/npm/tink/commit/40b1333))


### Features

* **prod:** disable fetching in production mode ([c8360c2](https://github.com/npm/tink/commit/c8360c2))



<a name="0.16.0"></a>
# [0.16.0](https://github.com/npm/tink/compare/v0.15.1...v0.16.0) (2018-11-21)


### Bug Fixes

* **fs:** return after calling cb in chmod ([#33](https://github.com/npm/tink/issues/33)) ([bd952d3](https://github.com/npm/tink/commit/bd952d3))
* **otplease:** promisify `read` ([#30](https://github.com/npm/tink/issues/30)) ([f7e31f6](https://github.com/npm/tink/commit/f7e31f6))
* **ping:** get ping tests passing again ([e0bdf2d](https://github.com/npm/tink/commit/e0bdf2d))
* **style:** standard --fix ([13648ec](https://github.com/npm/tink/commit/13648ec))
* **test:** get deprecate tests working again ([e5582ad](https://github.com/npm/tink/commit/e5582ad))
* **test:** refactor fs tests and get them passing again ([b7f7fd7](https://github.com/npm/tink/commit/b7f7fd7))
* **whoami:** get the command working a bit better ([b58387c](https://github.com/npm/tink/commit/b58387c))


### Features

* **access:** add `tink access` subcommands ([#12](https://github.com/npm/tink/issues/12)) ([efd6e18](https://github.com/npm/tink/commit/efd6e18))
* **build:** implement build command ([#29](https://github.com/npm/tink/issues/29)) ([dcd192a](https://github.com/npm/tink/commit/dcd192a))
* **commands:** add 'team' command ([#25](https://github.com/npm/tink/issues/25)) ([45baf37](https://github.com/npm/tink/commit/45baf37))
* **profile:** add `profile` subcommands ([#28](https://github.com/npm/tink/issues/28)) ([a33cca1](https://github.com/npm/tink/commit/a33cca1))
* **whoami:** Implement whoami command ([#31](https://github.com/npm/tink/issues/31)) ([c499d2a](https://github.com/npm/tink/commit/c499d2a))



<a name="0.15.1"></a>
## [0.15.1](https://github.com/npm/tink/compare/v0.15.0...v0.15.1) (2018-11-13)


### Bug Fixes

* **config:** get config stuff in a better place ([16e29cb](https://github.com/npm/tink/commit/16e29cb))



<a name="0.15.0"></a>
# [0.15.0](https://github.com/npm/tink/compare/v0.14.0...v0.15.0) (2018-11-13)


### Features

* **view:** add 'view' command ([#27](https://github.com/npm/tink/issues/27)) ([500207c](https://github.com/npm/tink/commit/500207c))



<a name="0.14.0"></a>
# [0.14.0](https://github.com/npm/tink/compare/v0.13.0...v0.14.0) (2018-11-12)


### Bug Fixes

* **installer:** improvements to automatic lazy require workflow ([45faca8](https://github.com/npm/tink/commit/45faca8))
* **pkglock:** fall back to regular ensure-pkg if installer fails-ish ([6c4f80d](https://github.com/npm/tink/commit/6c4f80d))
* **pkglock:** look for TINK_NO_PKG_LOCK ([1a15eb1](https://github.com/npm/tink/commit/1a15eb1))
* **worker:** remove debugging code ([ef6ef5b](https://github.com/npm/tink/commit/ef6ef5b))


### Features

* **add/rm:** run a `prepare` after an add and rm command ([ca7c0d5](https://github.com/npm/tink/commit/ca7c0d5))
* **commands:** add 'deprecate' command ([#23](https://github.com/npm/tink/issues/23)) ([be8735c](https://github.com/npm/tink/commit/be8735c))
* **rm:** add tink rm command ([5aefa20](https://github.com/npm/tink/commit/5aefa20))



<a name="0.13.0"></a>
# [0.13.0](https://github.com/npm/tink/compare/v0.12.0...v0.13.0) (2018-11-11)


### Features

* **add:** add tink add, to add new dependencies ([a2d36e6](https://github.com/npm/tink/commit/a2d36e6))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/npm/tink/compare/v0.11.0...v0.12.0) (2018-11-11)


### Bug Fixes

* **fs:** found the bugs! ([d8bd8e7](https://github.com/npm/tink/commit/d8bd8e7))
* **fs:** more fs tweaking ([76451b8](https://github.com/npm/tink/commit/76451b8))


### Features

* **fs:** make all fs operations optimistic ([#24](https://github.com/npm/tink/issues/24)) ([d4e6ec6](https://github.com/npm/tink/commit/d4e6ec6))



<a name="0.11.0"></a>
# [0.11.0](https://github.com/npm/tink/compare/v0.10.1...v0.11.0) (2018-11-09)


### Bug Fixes

* **fs:** make a few more things optimistic ([fd5542f](https://github.com/npm/tink/commit/fd5542f))
* **fs:** make lstat optimistic ([6aa6cf4](https://github.com/npm/tink/commit/6aa6cf4))
* **fs:** make readdir(Sync) merge local and virtual file listings ([811a441](https://github.com/npm/tink/commit/811a441))
* **installer:** make tinkifyBins log out files to tinkify ([834ca0d](https://github.com/npm/tink/commit/834ca0d))
* **installer:** move writeLockHash to the end ([a8f16ec](https://github.com/npm/tink/commit/a8f16ec))
* **installer:** tweak tinkifyBins a bit ([129a429](https://github.com/npm/tink/commit/129a429))
* **log:** nicer logging for restoring files ([86eb602](https://github.com/npm/tink/commit/86eb602))
* **org:** org add command params had wrong names ([#14](https://github.com/npm/tink/issues/14)) ([ee6cb34](https://github.com/npm/tink/commit/ee6cb34))
* **sh:** make sure patches are loaded before requiring module ([d06362b](https://github.com/npm/tink/commit/d06362b))
* **sh:** pull in the node override on script exec + stop clearing modules ([94c59b0](https://github.com/npm/tink/commit/94c59b0))


### Features

* **pkglock:** smarter restorer and fixed sh/prepare ([b19ba9c](https://github.com/npm/tink/commit/b19ba9c))
* **prepare:** allow prefetching of only specified deps ([e93fdbe](https://github.com/npm/tink/commit/e93fdbe))
* **sh:** do exclusively lazy dep fetching ([009afda](https://github.com/npm/tink/commit/009afda))



<a name="0.10.1"></a>
## [0.10.1](https://github.com/npm/tink/compare/v0.10.0...v0.10.1) (2018-11-08)



<a name="0.10.0"></a>
# [0.10.0](https://github.com/npm/tink/compare/v0.9.6...v0.10.0) (2018-11-08)


### Bug Fixes

* **cmd:** fix duplicate subcmd problem ([c6d508d](https://github.com/npm/tink/commit/c6d508d))
* **lint:** ignore linter on jsx for now because parsing issues ([d2ab0bf](https://github.com/npm/tink/commit/d2ab0bf))


### Features

* **org:** add `tink org` and subcommands ([038b9aa](https://github.com/npm/tink/commit/038b9aa))



<a name="0.9.6"></a>
## [0.9.6](https://github.com/npm/tink/compare/v0.9.5...v0.9.6) (2018-11-07)


### Bug Fixes

* **prepare:** move process.tink assignment into `prepare` ([2005fe0](https://github.com/npm/tink/commit/2005fe0))



<a name="0.9.5"></a>
## [0.9.5](https://github.com/npm/tink/compare/v0.9.4...v0.9.5) (2018-11-06)


### Bug Fixes

* **installer:** finish getting rid of pkgmaps ([c3f3ab7](https://github.com/npm/tink/commit/c3f3ab7))



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
