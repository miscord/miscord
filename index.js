require('./lib/logger')

const login = require('./lib/login/login')

const discordListener = require('./lib/listeners/discord')
const messengerListener = require('./lib/listeners/messenger')

module.exports = config => {
  global.config = config
  return login().then(() => {
    // when got a discord message
    config.discord.client.on('message', discordListener)

    // when got a messenger message
    config.messenger.stopListening = config.messenger.client.listen(messengerListener)
    return config
  })
}
