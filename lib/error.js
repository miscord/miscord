const log = require('npmlog')
module.exports = error => {
  var message = `Logs from NPM are unnecessary and don't give much information.
Miscord logs folder:
${require('../lib/config/getConfigDir')()}/logs`
  log.error('error', error)
  console.log('')
  log.warn('', message)
  if (global.config && global.config.ownerID && global.config.discord.client) {
    global.config.discord.client.fetchUser(global.config.ownerID)
      .then(user => user.createDM())
      .then(dmc => dmc.send(error instanceof Error ? `${error.message}\n${error.stack}` : typeof error !== 'string' ? JSON.stringify(error) : error, { code: true }))
      .then(m => process.exit(1))
      .catch(err => {
        log.error('DMError', err)
        process.exit(1)
      })
  } else {
    process.exit(1)
  }
}
