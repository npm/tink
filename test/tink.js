const tap = require('tap')
const { exec } = require('shelljs')

// just a simple test to test the command is working
// checks the exit code
tap.test(function (t) {
  exec('./bin/tink.js', {
    silent: true
  }, function (code, stdout, stderr) {
    t.equal(code, 1)
    t.end()
  })
})
