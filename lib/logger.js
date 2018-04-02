const path = require('path')
const os = require('os')

const getLogFolder = () => {
  if (process.env.NODE_ENV === 'development') return '../../logs'
  switch (process.platform) {
    case 'win32':
      return path.join(process.env.APPDATA, 'Miscord', 'logs')
    case 'linux':
      return path.join(os.homedir(), '.config', 'Miscord', 'logs')
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'Miscord', 'logs')
    default:
      return path.join(os.homedir(), '.miscord', 'logs')
  }
}

var filename = (new Date()).toJSON().replace('T', '_').replace(/:/g, '-').split('.')[0] + '.log'
var logStream = require('fs').createWriteStream(path.join(getLogFolder(), filename))

// https://gist.github.com/pguillory/729616/32aa9dd5b5881f6f2719db835424a7cb96dfdfd6
process.stderr.write = (function (write) {
  return function (string, encoding, fd) {
    write.apply(process.stderr, arguments)
    logStream.write(require('strip-ansi')(string), encoding, fd)
  }
})(process.stderr.write)
