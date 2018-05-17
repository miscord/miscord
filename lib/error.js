const log = require('npmlog')
module.exports = error => {
  var message = `Logs from NPM are unnecessary and don't give much information.
Miscord logs folder:
${require('../lib/config/getConfigDir')()}/logs`
  log.error('error', error)
  console.log('')
  log.warn('', message)
  process.exit(1)
}
