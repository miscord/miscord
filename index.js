require('./lib/logger')

const login = require('./lib/login')

const discordListener = require('./lib/discord/listener')
const messengerListener = require('./lib/messenger/listener')

module.exports = config => {
  if (!global.config) global.config = config
  return login().then(() => {
    // when got a discord message
    global.config.discord.client.on('message', discordListener)

    // when got a messenger message
    global.config.messenger.stopListening = global.config.messenger.client.listen(messengerListener)
  })
}
