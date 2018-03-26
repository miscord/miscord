var date = (new Date()).toJSON().replace('T', '_').replace(/:/g, '-').split('.')[0]
var logStream = require('fs').createWriteStream('./logs/' + date + '.log')
process.stderr.write = (function (write) {
  return function (string, encoding, fd) {
    write.apply(process.stderr, arguments)
    logStream.write(require('strip-ansi')(string), encoding, fd)
  }
})(process.stderr.write)
