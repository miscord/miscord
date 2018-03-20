const log = require('npmlog')
module.exports = async params => {
  var { name, config, topic } = params
  log.level = config.logLevel

  log.verbose('getChannel', 'Looking up channel with name %s and topic %s', name, topic)

  // try searching by topic
  var channel = config.discord.channels.get(topic)
  // if found, change name and return
  log.silly('getChannel', channel)
  if (channel) return config.discord.renameChannels ? (channel.name === name ? channel : channel.edit({ name })) : channel

  // if not found, create new channel with specified name and set its parent and topic
  channel = await config.discord.guild.createChannel(name, 'text')
  config.discord.channels.set(topic, channel)
  channel.setParent(config.discord.category)
  channel.setTopic(topic)
  log.silly('getChannel', channel)
  return channel
}
