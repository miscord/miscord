const Command = require('./Command')
const log = require('npmlog')

module.exports = new Command(async _ => {
  await discord.client.destroy()
  log.info('logout', 'Logged out from Discord')
  process.exit(0)
})
