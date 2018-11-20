'use strict'

const fs = require('fs')
const path = require('path')
const tap = require('tap')
const { overrideNode } = require('../../lib/node/fs')

overrideNode()

// lstatSync

tap.test('lstatSync', function (test) {
  const stat = fs.lstatSync(path.resolve('test'))
  test.ok(stat, 'lstatSync should return valid result')
  test.true(stat.isDirectory(), 'lstatSync should set isDirectory true')
  test.end()
})

tap.test('lstatSync', function (test) {
  try {
    fs.lstatSync(path.resolve(`foo-${Date.now()}-test`))
    test.fail('expect lstatSync to throw')
  } catch (err) {}
  test.end()
})

// lstat

tap.test('lstat', function (test) {
  fs.lstat(path.resolve('test'), (err, stat) => {
    test.notOk(err, `lstat should not fail with error`)
    test.ok(stat, 'lstat should return valid result')
    test.true(stat.isDirectory(), 'lstat should set isDirectory true')
    test.end()
  })
})

tap.test('lstat', function (test) {
  fs.lstat(path.resolve(`foo-${Date.now()}-test`), (err, stat) => {
    test.ok(err, 'expect lstat to fail')
    test.end()
  })
})

// statSync

tap.test('statSync', function (test) {
  const stat = fs.statSync(path.resolve('test'))
  tap.ok(stat, 'statSync should return valid result')
  tap.true(stat.isDirectory(), 'statSync should set isDirectory true')
  test.end()
})

tap.test('statSync', function (test) {
  try {
    fs.statSync(path.resolve(`foo-${Date.now()}-test`))
    test.fail('expect statSync to throw')
  } catch (err) {}
  test.end()
})

// stat

tap.test('stat', function (test) {
  fs.stat(path.resolve('test'), (err, stat) => {
    test.notOk(err, `stat should not fail with error`)
    test.ok(stat, 'stat should return valid result')
    test.true(stat.isDirectory(), 'stat should set isDirectory true')
    test.end()
  })
})

tap.test('stat', function (test) {
  fs.stat(path.resolve(`foo-${Date.now()}-test`), (err, stat) => {
    test.ok(err, 'expect stat to fail')
    test.end()
  })
})

// skipping statSyncNoException

// realpathSync

tap.test('realpathSync', function (test) {
  const rp = fs.realpathSync('.')
  test.equal(rp, process.cwd(), 'realpathSync should return cwd')
  // test exception
  try {
    fs.realpathSync(`/non-existing-dir-${Date.now()}`)
    test.fail(`realpathSync should throw`)
  } catch (e) {}
  test.end()
})

tap.test('realpathSync', function (test) {
  try {
    fs.realpathSync(`/non-existing-dir-${Date.now()}`)
    test.fail(`realpathSync should throw`)
  } catch (e) {}
  test.end()
})

// realpath

tap.test('realpath', function (test) {
  fs.realpath('.', (err, rp) => {
    test.notOk(err, 'realpath should not fail')
    test.equal(rp, process.cwd(), 'realpath should return cwd')
    test.end()
  })
})

tap.test('realpath', function (test) {
  fs.realpath(`/non-existing-dir-${Date.now()}`, (err, rp) => {
    test.ok(err, 'realpath should fail with error')
    test.end()
  })
})

// skip standard deprecated fs.exists

// existsSync

tap.test('existsSync', function (test) {
  const flag = fs.existsSync(path.resolve('test'))
  test.equal(flag, true, 'exists should return true')
  test.end()
})

tap.test('existsSync', function (test) {
  const flag = fs.existsSync(`/non-existing-dir-${Date.now()}`)
  test.equal(flag, false, 'exists should return false')
  test.end()
})

// access

tap.test('access', function (test) {
  fs.access(path.resolve('test'), (err) => {
    test.notOk(err, 'access should return OK')
    test.end()
  })
})

tap.test('access', function (test) {
  fs.access(path.resolve('test'), fs.constants.F_OK, (err, result) => {
    test.notOk(err, 'access should return OK with F_OK mode')
    test.end()
  })
})

tap.test('access', function (test) {
  fs.access(path.resolve('package.json'), fs.constants.R_OK, (err) => {
    test.notOk(err, 'access should return OK with R_OK mode')
    test.end()
  })
})

tap.test('access', function (test) {
  fs.access(path.resolve(`/non-existing-dir-${Date.now()}`), fs.constants.R_OK, (err) => {
    test.equal(err.code, 'ENOENT', 'access fail with ENOENT')
    test.end()
  })
})

tap.test('access', function (test) {
  fs.access(path.resolve(`/etc/passwd`), fs.constants.W_OK, (err) => {
    test.equal(err.code, 'EACCES', 'access fail with EACCES for W_OK on /etc/passwd')
    test.end()
  })
})

// accessSync

tap.test('accessSync', function (test) {
  try {
    fs.accessSync(path.resolve('test'))
    test.end()
  } catch (err) {
    test.fail('accessSync should return OK')
  }
})

tap.test('accessSync', function (test) {
  try {
    fs.accessSync(path.resolve('test'), fs.constants.F_OK)
    test.end()
  } catch (err) {
    test.fail('accessSync should return OK with F_OK mode')
  }
})

tap.test('accessSync', function (test) {
  try {
    fs.accessSync(path.resolve('package.json'), fs.constants.R_OK)
    test.end()
  } catch (err) {
    test.fail('accessSync should return OK with R_OK mode')
  }
})

tap.test('accessSync', function (test) {
  try {
    fs.accessSync(path.resolve(`/non-existing-dir-${Date.now()}`), fs.constants.R_OK)
    test.fail('accessSync should fail with ENOENT')
  } catch (err) {
    test.end()
  }
})

tap.test('accessSync', function (test) {
  try {
    fs.accessSync(path.resolve(`/etc/passwd`), fs.constants.W_OK)
    test.fail('accessSync should fail with EACCES for W_OK on /etc/passwd')
  } catch (err) {
    test.end()
  }
})

// readFile

tap.test('readFile', function (test) {
  fs.readFile(path.resolve('package.json'), (err, data) => {
    test.notOk(err, 'readFile should be OK')
    try {
      test.equal(Buffer.isBuffer(data), true, 'readFile should load package.json as Buffer')
      JSON.parse(data)
      test.end()
    } catch (err) {
      test.fail('readFile should load package.json')
    }
  })
})

tap.test('readFile', function (test) {
  fs.readFile(path.resolve('package.json'), 'utf8', (err, data) => {
    test.notOk(err, 'readFile utf8 encoding should be OK')
    try {
      test.equal(typeof data, 'string', 'readFile utf8 encoding should load package.json as string')
      JSON.parse(data)
      test.end()
    } catch (err) {
      test.fail('readFile utf8 encoding should load package.json')
    }
  })
})

// readFileSync

tap.test('readFileSync', function (test) {
  try {
    const data = fs.readFileSync(path.resolve('package.json'))
    test.equal(Buffer.isBuffer(data), true, 'readFileSync should load package.json as Buffer')
    JSON.parse(data)
    test.end()
  } catch (err) {
    test.fail('readFileSync should load package.json')
  }
})

tap.test('readFileSync', function (test) {
  try {
    const data = fs.readFileSync(path.resolve('package.json'), 'utf8')
    test.equal(typeof data, 'string', 'readFileSync utf8 encoding should load package.json as string')
    JSON.parse(data)
    test.end()
  } catch (err) {
    test.fail('readFileSync utf8 encoding should load package.json')
  }
})

// readdir

tap.test('readdir', function (test) {
  fs.readdir(path.resolve('test/fixtures/fs/readdir'), (err, files) => {
    test.notOk(err, 'readdir should return no error')
    test.equal(files.sort().join(','), 'bar,foo,tmp', 'readdir should read dir entries')
    test.end()
  })
})

// readdirSync

tap.test('readdirSync', function (test) {
  try {
    const files = fs.readdirSync(path.resolve('test/fixtures/fs/readdir'))
    test.equal(files.sort().join(','), 'bar,foo,tmp', 'readdirSync should read dir entries')
    test.end()
  } catch (err) {
    test.fail(err, 'readdirSync should return no error')
  }
})

// chmod

function testChmod (test, filename, mode) {
  const verify = (expectMode, cb) => {
    fs.stat(filename, (err, stat) => {
      test.notOk(err, `stat ${filename} failed`)
      const newMode = stat.mode & 0o777
      test.equal(newMode, expectMode, `stat not agree with chmod on mode: ${newMode} vs ${expectMode}`)
      cb()
    })
  }

  fs.stat(filename, (err, stat) => {
    test.notOk(err, `stat ${filename} failed`)
    const origMode = stat.mode & 0o777
    fs.chmod(filename, mode, (err) => {
      test.notOk(err, `a. chmod ${mode} failed ${err}`)
      verify(mode, () => {
        fs.chmod(filename, origMode, (err) => {
          test.notOk(err, `b. chmod ${mode} failed ${err}`)
          verify(origMode, () => {
            test.end()
          })
        })
      })
    })
  })
}

tap.test('chmod', function (test) {
  testChmod(test, path.resolve('test/fixtures/fs'), 0o777)
})

// open

// openSync

// createReadStream

// createWriteStream
