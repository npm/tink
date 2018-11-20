'use strict'

const fs = require('fs')
const path = require('path')
const { test } = require('tap')
const { overrideNode } = require('../../lib/node/fs')

overrideNode()

// lstatSync

test('lstatSync', t => {
  const stat = fs.lstatSync(path.resolve('test'))
  t.ok(stat, 'lstatSync should return valid result')
  t.true(stat.isDirectory(), 'lstatSync should set isDirectory true')
  t.end()
})

test('lstatSync', t => {
  try {
    fs.lstatSync(path.resolve(`foo-${Date.now()}-test`))
    t.fail('expect lstatSync to throw')
  } catch (err) {}
  t.end()
})

// lstat

test('lstat', t => {
  fs.lstat(path.resolve('test'), (err, stat) => {
    t.notOk(err, `lstat should not fail with error`)
    t.ok(stat, 'lstat should return valid result')
    t.true(stat.isDirectory(), 'lstat should set isDirectory true')
    t.end()
  })
})

test('lstat', t => {
  fs.lstat(path.resolve(`foo-${Date.now()}-test`), (err, stat) => {
    t.ok(err, 'expect lstat to fail')
    t.end()
  })
})

// statSync

test('statSync', t => {
  const stat = fs.statSync(path.resolve('test'))
  t.ok(stat, 'statSync should return valid result')
  t.true(stat.isDirectory(), 'statSync should set isDirectory true')
  t.end()
})

test('statSync', t => {
  try {
    fs.statSync(path.resolve(`foo-${Date.now()}-test`))
    t.fail('expect statSync to throw')
  } catch (err) {}
  t.end()
})

// stat

test('stat', t => {
  fs.stat(path.resolve('test'), (err, stat) => {
    t.notOk(err, `stat should not fail with error`)
    t.ok(stat, 'stat should return valid result')
    t.true(stat.isDirectory(), 'stat should set isDirectory true')
    t.end()
  })
})

test('stat', t => {
  fs.stat(path.resolve(`foo-${Date.now()}-test`), (err, stat) => {
    t.ok(err, 'expect stat to fail')
    t.end()
  })
})

// skipping statSyncNoException

// realpathSync

test('realpathSync', t => {
  const rp = fs.realpathSync('.')
  t.equal(rp, process.cwd(), 'realpathSync should return cwd')
  // test exception
  try {
    fs.realpathSync(`/non-existing-dir-${Date.now()}`)
    t.fail(`realpathSync should throw`)
  } catch (e) {}
  t.end()
})

test('realpathSync', t => {
  try {
    fs.realpathSync(`/non-existing-dir-${Date.now()}`)
    t.fail(`realpathSync should throw`)
  } catch (e) {}
  t.end()
})

// realpath

test('realpath', t => {
  fs.realpath('.', (err, rp) => {
    t.notOk(err, 'realpath should not fail')
    t.equal(rp, process.cwd(), 'realpath should return cwd')
    t.end()
  })
})

test('realpath', t => {
  fs.realpath(`/non-existing-dir-${Date.now()}`, (err, rp) => {
    t.ok(err, 'realpath should fail with error')
    t.end()
  })
})

// skip standard deprecated fs.exists

// existsSync

test('existsSync', t => {
  const flag = fs.existsSync(path.resolve('test'))
  t.equal(flag, true, 'exists should return true')
  t.end()
})

test('existsSync', t => {
  const flag = fs.existsSync(`/non-existing-dir-${Date.now()}`)
  t.equal(flag, false, 'exists should return false')
  t.end()
})

// access

test('access', t => {
  fs.access(path.resolve('test'), (err) => {
    t.notOk(err, 'access should return OK')
    t.end()
  })
})

test('access', t => {
  fs.access(path.resolve('test'), fs.constants.F_OK, (err, result) => {
    t.notOk(err, 'access should return OK with F_OK mode')
    t.end()
  })
})

test('access', t => {
  fs.access(path.resolve('package.json'), fs.constants.R_OK, (err) => {
    t.notOk(err, 'access should return OK with R_OK mode')
    t.end()
  })
})

test('access', t => {
  fs.access(path.resolve(`/non-existing-dir-${Date.now()}`), fs.constants.R_OK, (err) => {
    t.equal(err.code, 'ENOENT', 'access fail with ENOENT')
    t.end()
  })
})

test('access', t => {
  fs.access(path.resolve(`/etc/passwd`), fs.constants.W_OK, (err) => {
    t.ok(err.code === 'EACCES' || err.code === 'EPERM', 'access fail with right code for W_OK on /etc/passwd')
    t.end()
  })
})

// accessSync

test('accessSync', t => {
  try {
    fs.accessSync(path.resolve('test'))
    t.end()
  } catch (err) {
    t.fail('accessSync should return OK')
  }
})

test('accessSync', t => {
  try {
    fs.accessSync(path.resolve('test'), fs.constants.F_OK)
    t.end()
  } catch (err) {
    t.fail('accessSync should return OK with F_OK mode')
  }
})

test('accessSync', t => {
  try {
    fs.accessSync(path.resolve('package.json'), fs.constants.R_OK)
    t.end()
  } catch (err) {
    t.fail('accessSync should return OK with R_OK mode')
  }
})

test('accessSync', t => {
  try {
    fs.accessSync(path.resolve(`/non-existing-dir-${Date.now()}`), fs.constants.R_OK)
    t.fail('accessSync should fail with ENOENT')
  } catch (err) {
    t.end()
  }
})

test('accessSync', t => {
  try {
    fs.accessSync(path.resolve(`/etc/passwd`), fs.constants.W_OK)
    t.fail('accessSync should fail with EACCES for W_OK on /etc/passwd')
  } catch (err) {
    t.end()
  }
})

// readFile

test('readFile', t => {
  fs.readFile(path.resolve('package.json'), (err, data) => {
    t.notOk(err, 'readFile should be OK')
    try {
      t.equal(Buffer.isBuffer(data), true, 'readFile should load package.json as Buffer')
      JSON.parse(data)
      t.end()
    } catch (err) {
      t.fail('readFile should load package.json')
    }
  })
})

test('readFile', t => {
  fs.readFile(path.resolve('package.json'), 'utf8', (err, data) => {
    t.notOk(err, 'readFile utf8 encoding should be OK')
    try {
      t.equal(typeof data, 'string', 'readFile utf8 encoding should load package.json as string')
      JSON.parse(data)
      t.end()
    } catch (err) {
      t.fail('readFile utf8 encoding should load package.json')
    }
  })
})

// readFileSync

test('readFileSync', t => {
  try {
    const data = fs.readFileSync(path.resolve('package.json'))
    t.equal(Buffer.isBuffer(data), true, 'readFileSync should load package.json as Buffer')
    JSON.parse(data)
    t.end()
  } catch (err) {
    t.fail('readFileSync should load package.json')
  }
})

test('readFileSync', t => {
  try {
    const data = fs.readFileSync(path.resolve('package.json'), 'utf8')
    t.equal(typeof data, 'string', 'readFileSync utf8 encoding should load package.json as string')
    JSON.parse(data)
    t.end()
  } catch (err) {
    t.fail('readFileSync utf8 encoding should load package.json')
  }
})

// readdir

test('readdir', t => {
  fs.readdir(path.resolve('test/fixtures/fs/readdir'), (err, files) => {
    t.notOk(err, 'readdir should return no error')
    t.equal(files.sort().join(','), 'bar,foo,tmp', 'readdir should read dir entries')
    t.end()
  })
})

// readdirSync

test('readdirSync', t => {
  try {
    const files = fs.readdirSync(path.resolve('test/fixtures/fs/readdir'))
    t.equal(files.sort().join(','), 'bar,foo,tmp', 'readdirSync should read dir entries')
    t.end()
  } catch (err) {
    t.fail(err, 'readdirSync should return no error')
  }
})

// chmod

function testChmod (t, filename, mode) {
  const verify = (expectMode, cb) => {
    fs.stat(filename, (err, stat) => {
      t.notOk(err, `stat ${filename} failed`)
      const newMode = stat.mode & 0o777
      t.equal(newMode, expectMode, `stat not agree with chmod on mode: ${newMode} vs ${expectMode}`)
      cb()
    })
  }

  fs.stat(filename, (err, stat) => {
    t.notOk(err, `stat ${filename} failed`)
    const origMode = stat.mode & 0o777
    fs.chmod(filename, mode, (err) => {
      t.notOk(err, `a. chmod ${mode} failed ${err}`)
      verify(mode, () => {
        fs.chmod(filename, origMode, (err) => {
          t.notOk(err, `b. chmod ${mode} failed ${err}`)
          verify(origMode, () => {
            t.end()
          })
        })
      })
    })
  })
}

test('chmod', t => {
  testChmod(t, path.resolve('test/fixtures/fs'), 0o777)
})

// open

// openSync

// createReadStream

// createWriteStream
