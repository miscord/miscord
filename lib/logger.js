const path = require('path')
const getConfigDir = require('./config/getConfigDir')

module.exports = configPath => {
  var dir = path.join(getConfigDir(configPath), 'logs')
  require('mkdirp').sync(dir, err => { throw err })

  var filename = (new Date()).toJSON().replace('T', '_').replace(/:/g, '-').split('.')[0] + '.log'
  var logStream = require('fs').createWriteStream(path.join(dir, filename))

  // https://gist.github.com/pguillory/729616/32aa9dd5b5881f6f2719db835424a7cb96dfdfd6
  process.stderr.write = (function (write) {
    return function (string, encoding, fd) {
      if (string === 'close\n') {
        return logStream.end(() => process.exit(1))
      }
      write.apply(process.stderr, arguments)
      logStream.write(require('strip-ansi')(string), encoding, fd)
    }
  })(process.stderr.write)
}
