const log = require('npmlog')
module.exports = error => {
  var message = `Logs from NPM are unnecessary and don't give much information.
Miscord logs folder:
${require('../lib/config/getConfigDir')()}/logs`
  log.error('error', error)
  console.log('')
  log.warn('', message)
  if (config != null && config.errorChannel) {
    let errorMessage = error instanceof Error
      ? `${error.message}\n${error.stack}`
      : typeof error !== 'string' ? JSON.stringify(error) : error
    config.errorChannel.send(errorMessage, { code: true })
      .then(m => console.error('close'))
      .catch(err => {
        log.error('DMError', err)
        console.error('close')
      })
  } else {
    console.error('close')
  }
}
