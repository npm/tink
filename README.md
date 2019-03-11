# tink [![npm](https://img.shields.io/npm/v/tink.svg)](https://npm.im/tink) [![license](https://img.shields.io/npm/l/tink.svg)](https://npm.im/tink) [![Travis](https://img.shields.io/travis/npm/tink.svg)](https://travis-ci.org/npm/tink) [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/npm/tink?svg=true)](https://ci.appveyor.com/project/npm/tink) [![Coverage Status](https://coveralls.io/repos/github/npm/tink/badge.svg?branch=latest)](https://coveralls.io/github/npm/tink?branch=latest)

[`tink`](https://github.com/npm/tink) is an experimental package manager for
JavaScript. Don't expect to be able to use this with any of your existing
projects.

## **IN DEVELOPMENT**

This package is still in development. Do **not** use it for production. It is
missing major features and the interface should be considered extremely
unstable.

If you're feeling adventurous, though, read ahead...

## Usage

`$ npx tink`

## Table of Contents

* [Features](#features)
* [Contributing](#contributing)
* [Acknowledgements](#acknowledgements)
* [Commands](#commands)
* [Options](#options)

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

### Commands

#### A Note About These Docs

The commands documented below are not normative, and may not reflect the current
state of tink development. They are being written separately from the code
itself, and may be entirely missing, or named something different, or behave
completely different. tink is still under heavy development and you should
expect everything to change without notice.

##### <a name="tink-shell"></a> `$ tink shell [options] [arguments]`

* Aliases: `tink sh`, `tish`

Starts an interactive `tink` shell. If `-e` or `-p` options are used, the string
passed to them will be executed as a single line and the shell will exit
immediately. If `[arguments]` is provided, it should be one or more executable
JavaScript files, which will be loaded serially.

The interactive `tink` shell will automatically generate a `.package-map.json`
describing all expected dependency files, and will fetch and make available any
missing or corrupted data, as it's required. `tink` overrides most of Node's
`fs` API to virtually load `node_modules` off a centralized cache without ever
linking or extracting to `node_modules` itself.

By default, `tink shell` will automatically install and add any missing or
corrupted dependencies that are found during the loading process. To disable
this feature, use the `--production` or `--offline` options.

To get a physical `node_modules/` directory to interact with, see [`tink
unwind`](#tink-unwind).

##### <a name="tink-prepare"></a> `$ tink prepare [options] [package...]`

* Aliases: `tink prep`

Preloads declared dependencies. You can use this to make sure that by the time
you use [`tink shell`](#tink-shell), all declared dependencies will already be
cached and available, so there won't be any execution delay from inline fetching
and repairing. If anything is missing or corrupted, it will be automatically
re-fetched.

If one or more `package`s are passed in, they should be the names of packages
already in `package.json`, and only the listed packages will be preloaded,
instead of preloading all of them. If you want to add a new dependency, use
[`tink add`](#tink-add) instead, which will also `prepare` the new dependencies
for you (so `tink prepare` isn't necessary after a `tink add`).

##### <a name="tink-exec"></a> `$ tink exec [options] <pkg> [--] [args...]`

* Aliases: `tink x`, `tx`

Like [`npx`](https://npm.im/npx), but for tink. Runs any binaries directly
through tink.

##### <a name="tink-unwind"></a> `$ tink unwind [options] [package...]`

* Aliases: `tink extract`, `tink frog`, `tink unroll`

Unwinds the project's dependencies into physical files in `node_modules/`,
instead of using the fs overrides to load them. This "unwound" mode can be used
to directly patch dependencies (for example, when debugging or preparing to
fork), or to enable compatibility with non-tink-related tools.

If one or more `[package...]` arguments are provided, the unwinding process will
only apply to those dependencies *and their dependencies*. In this case,
`package` **must** be a **direct** dependency of your toplevel package. You
cannot selectively unwind transitive dependencies, but you **can** make it so
they're the only ones that stick around when you go back to tink mode. See
[`tink wind`](#tink-wind) for the corresponding command.

If `--production`, `--only=<prod|dev>`, or `--also=<prod|dev>` options are
passed in, they can be used to limit which dependency types get unwound.

By default, this command will leave any files that were already in
`node_modules/` intact, so your patches won't be clobbered. To do a full reset,
or a specific reset on a file, remove the specific file or all of
`node_modules/` manually before calling `tink unwind`

##### <a name="tink-wind"></a> `$ tink wind [options] [package...]`

* Aliases: `tink roll`, `tink rewind`, `tink knit`

Removes physical files from `node_modules/` and configures a project to use
"tink mode" for development -- a mode where dependency files are virtually
loaded through `fs` API overrides off a central cache. This mode can greatly
speed up install and start times, as well as conserve large amounts of space by
sharing files (securely) across multiple projects.

If one or more `[package...]` arguments are provided, the wind-up process will
only move the listed packages and any non-shared dependencies into the global
cache to be served from there. Note that only direct dependencies can be
requested this way -- there is no way to target specific transitive dependencies
in `tink wind`, much like in `tink unwind`.

Any individual files in `node_modules` which do not match up with their standard
hashes from their original packages will be left in place, unless the
`--wind-all` option is used. For example, if you use [`tink
unwind`](#tink-unwind), then patch one of your dependencies with some
`console.log()` calls, and you then do `tink rewind`, then the files you added
`console.log()` to will remain in `node_modules/`, and be prioritized by `tink`
when loading your dependencies. Any other files, including those for the same
package, will be moved into the global cache and loaded from there as usual.

##### <a name="tink-add"></a> `$ tink add [options] [spec...]`

Downloads and installs each `spec`, which must be a valid dependency specifier
parseable by [`npm-package-arg`](https://npm.im/npm-package-arg), and adds the
newly installed dependency or dependencies to both `package.json` and
`package-lock.json`, as well as updating `.package-map.json` as needed.

##### <a name="tink-rm"></a> `$ tink rm [options] [package...]`

Removes each `package`, which should be a package name currently specified in
`package.json`, from the current project's dependencies, updating
`package.json`, `package-lock.json`, and `.package-map.json` as needed.

##### <a name="tink-update"></a> `$ tink update [options] [spec...]`

* Aliases: `tink up`

Runs an interactive dependency update/upgrade UI where individual package
updates can be selected. If one or more `package` arguments are passed in, the
update prompts will be limited to packages in the tree matching those
specifiers. The specifiers support full
[`npm-package-arg`](https://npm.im/npm-package-arg) specs and are used for
**matching existing dependencies**, not the target versions to upgrade to.

If run outside of a TTY environment or if the `--auto` option is passed in, all
dependencies, optionally limited to each named `package`, are updated to their
maximum semver-compatible version, effectively simulating a fresh install of the
project with the current declared `package.json` dependencies and no
`node_modules` or `package-lock.json` present.

##### <a name="tink-audit"></a> `$ tink audit [options]`

* Aliases: `tink odd`, `tink audi`

Executes a full security scan of the project's dependencies, using the
configured registry's audit service. `--production`, `--only`, and `--also` can
be used to filter which dependency types are checked. `--level` can be used to
specify the minimum vulnerability level that will make the command exit with
a non-zero exit code (an error).

##### <a name="tink-check-lock"></a> `$ tink check-lock [options]`

* Aliases: `tink lock`

Verifies that `package.json` and `package-lock.json` are in sync. If `--auto` is
specified, the inconsistency will be automatically corrected, using
`package.json` as the source of truth.

##### <a name="tink-check-licenses"></a> `$ tink check-licenses [options] [spec...]`

By default, verifies that the current project has a valid `"license"` field, and
that all dependencies (and transitive dependencies) have valid licenses
configured.

If one or more `spec` arguments are provided, this behavior changes such that
only the packages specified by the `spec`s get verified according to current
settings.

A list of detected licenses will be printed out. Use `--json` to get the
licenses in a parseable format.

Additionally, two `package.json` fields can be used to further configure the
license-checking behavior:

* `"blacklist": [licenses...]` - Any detected licenses listed here will trigger an error for `tink check-licenses`. This takes precedence over `"whitelist"`
* `"whitelist": [licenses...]` - Any detected licenses NOT listed in here will trigger an error.

##### <a name="tink-lint"></a> `$ tink lint [options]`

* Aliases: `tink typecheck`, `tink type`

Executes the configured `lint` and `typecheck` script(s) (in that order), or a
default baseline linter will be used to report obvious syntax errors in the
codebase's JavaScript.

##### <a name="tink-build"></a> `$ tink build [options]`

Executes the configured `build` script, if present, or executes silently.

##### <a name="tink-clean"></a> `$ tink clean [options]`

Removes `.package-map.json` and executes the `clean` run-script, which should
remove any artifacts generated by [`tink build`](#tink-build).

##### <a name="tink-test"></a> `$ tink test [options]`

Executed the configured `test` run-script. Exits with an error code if no `test`
script is configured.

##### <a name="tink-check"></a> `$ tink check`

Executes all verification-related scripts in the following sequence, grouping
the output together into one big report:

1. [`tink check-lock`](#tink-check-lock) - verify that the `package-lock.json` and `package.json` are in sync, and that `.package-map.json` is up to date.
1. [`tink audit`](#tink-audit) - runs a security audit of the project's dependencies.
1. [`tink check-licenses`](#tink-check-licenses) - verifies that the current project has a license configured, and that all dependencies have valid licenses, and that none of those licenses are blacklisted (or, if using a whitelist, that they are all in said whitelist -- see the `tink check-licenses` docs for details).
1. [`tink lint`](#tink-lint) - runs the configured linter, or a general, default linter that statically scans for syntax errors.
1. [`tink build`](#tink-build) - if a build script is configured, the build will be executed to make sure it completes successfully -- otherwise, this step is skipped.
1. [`tink test`](#tink-test) - runs the configured test suite. skipped if no tests configured, but a warning will be emitted.

The final report includes potential action items related to each step. Use
`--verbose` to see more detailed output for each report.

##### <a name="tink-publish"></a> `$ tink publish [options] [tarball...]`

Publishes the current package to the configured `registry`. The package will be
turned into a tarball using `tink pack`, and the tarball will then be uploaded.
This command will also print out a summary of tarball details, including the
files that were included and the hashes for the tarball.

If One-Time-Passwords are configured on the registry and the terminal is a TTY,
this command will prompt for an OTP token if `--otp <token>` is not used. If
this happens outside of a TTY, the command will fail with an EOTP error.

Unlike `npm publish`, `tink publish` **requires** that `package.json` include a
`"files":[]` array specifying which files will be included in the publish,
otherwise the publish will fail with an error. `.npmignore` is obeyed, but does
not remove the requirement for `"files"`.

If `--dry-run` is used, all steps will be done, except the final data upload to
the registry. Because the upload never happens, `--dry-run` can't be used to
verify that publish credentials work.

If one or more `tarball` arguments are passed, they will be treated as
[`npm-package-arg`](https://npm.im/npm-package-arg) specifiers, fetched, and
re-published. This is most useful with git repositories and local tarballs that
have already been packaged up by [`tink pack`](#tink-pack)

##### <a name="tink-pack"></a> `$ tink pack [options] [spec...]`

Collects the current package into a tarball and writes it to
`./<pkgname>-<pkgversion>.tgz`. Also prints out a summary of tarball details,
including the files that were included and the hashes for the tarball.

Unlike `npm pack`, `tink pack` **requires** that `package.json` include a
`"files":[]` array specifying which files will be included in the publish,
otherwise the publish will fail with an error. `.npmignore` is obeyed, but does
not remove the requirement for `"files"`.

If one or more `spec` arguments are passed, they will be treated as
[`npm-package-arg`](https://npm.im/npm-package-arg) specifiers, fetched, and
their tarballed packages written to the current directory. This is most useful
for fetching the tarballs of registry-hosted dependencies. For example: `$ tink
pack react@1.2.3` will write the tarball to `./react-1.2.3.tgz`.

##### <a name="tink-login"></a> `$ tink login`

Use this command to log in to the current npm registry. This command may open a
browser window.

##### <a name="tink-logout"></a> `$ tink logout`

Use this command to remove any auth tokens for the current registry from your
configuration.

##### <a name="tink-profile"></a> `$ tink profile`

Use this command to fetching and updating your npm profile.

* Aliases: `tink p`

###### Subcommands:
* `tink profile get [<property>] [options]`: display one or more properties of the authenticated user profile.
* `tink profile set <property> <value> [options]`: update profile information for the authenticated user.
* `tink profile set password [options]`: update the password of the authenticated user.
* `tink profile disable-2fa [options]`: disable two-factor authentication for the authenticated user.
* `tink profile enable-2fa [options]`: enable two-factor authentication for the authenticated user.
* `tink profile create-token [options]`: create a new authentication token, possibly with restrictions.
* `tink profile remove-token <token|key> [options]`: remove a specific authentication token. Aliases: `revoke-token`, `rm`.
* `tink profile list-tokens [options]`: fetch a list of all the authentication tokens the authenticated user has. Alias: `lt`.
