const log = require('npmlog')
module.exports = error => {
  log.error('error', error)

  console.log('')
  log.warn('', `Logs from NPM are unnecessary and don't give much information.
  Miscord logs folder:
  ${require('../lib/config/getConfigDir')()}/logs`)

  if (discord && discord.errorChannel) {
    let errorMessage = error instanceof Error
      ? `${error.message}\n${error.stack}`
      : typeof error !== 'string' ? JSON.stringify(error) : error
    discord.errorChannel.send(errorMessage, { code: true })
      .then(m => console.error('close'))
      .catch(err => {
        log.error('DMError', err)
        console.error('close')
      })
  } else {
    console.error('close')
  }
}
