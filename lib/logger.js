const path = require('path')
const getConfigDir = require('./config/getConfigDir')
const strip = require('strip-ansi')
const getDate = () => (new Date()).toJSON().replace('T', ' ').split('.')[0]
const getWritableDate = () => (new Date()).toJSON().replace('T', '_').replace(/:/g, '-').split('.')[0]
const getTimestamped = (message, type) => ((global.config && config[type + 'Timestamps']) ? `[${getDate()}] ` : '') + message

module.exports = configPath => {
  const dir = path.join(getConfigDir(configPath), 'logs')
  require('mkdirp').sync(dir, err => { throw err })

  const filename = getWritableDate() + '.log'
  const logStream = require('fs').createWriteStream(path.join(dir, filename))

  let line = ''

  // https://gist.github.com/pguillory/729616/32aa9dd5b5881f6f2719db835424a7cb96dfdfd6
  process.stderr.write = (function (write) {
    return function (string, encoding, fd) {
      if (string === 'close\n') return logStream.end(() => process.exit(1))
      line += string
      if (!string.includes('\n')) return
      write.call(process.stderr, getTimestamped(line, 'console'), encoding, fd)
      logStream.write(strip(getTimestamped(line, 'logs')), encoding, fd)
      line = ''
    }
  })(process.stderr.write)
}
