const log = require('npmlog')
module.exports = error => {
  log.error('error', error)
  process.exit(1)
}
