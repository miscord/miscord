const login = require('./lib/login')

const { inspect } = require('util')
const discordListener = require('./lib/discord/listener')
const messengerListener = require('./lib/messenger/listener')
const messengerEventListener = require('./lib/messenger/handleEvent')

module.exports = config => {
  if (!global.config) global.config = config
  if (!global.logger) global.logger = require('consola')
  if (!global.toStr) global.toStr = (object, depth = 2) => inspect(object, { depth })
  return login().then(() => {
    // when got a discord message
    discord.client.on('message', discordListener)

    // when got a messenger message
    messenger.client.on('message', messengerListener)

    // when got a messenger event
    messenger.client.on('event', messengerEventListener)
  })
}
