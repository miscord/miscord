require('./lib/logger.js')

const sendError = require('./lib/error.js')
const login = require('./lib/login/login.js')

const discordListener = require('./lib/listeners/discord.js')
const messengerListener = require('./lib/listeners/messenger.js')

module.exports = config => {
  return login(config).then(config => {
    // when got a discord message
    config.discord.client.on('message', message => discordListener({config, message}))

    // when got a messenger message
    config.messenger.client.listen((err, message) => messengerListener({config, err, message}))
    return config
  }).catch(sendError)
}