const Command = require('./Command')
const log = logger.withScope('commands:quit')

module.exports = new Command(async _ => {
  await discord.client.destroy()
  log.success('Logged out from Discord')
  process.exit(0)
})
