module.exports = async params => {
  var { guild, name, config, topic } = params

  // try searching by topic
  var channel = config.discord.channels.get(topic)
  // if found, change name and return
  if (channel) return channel.name === name ? channel : channel.edit({ name })

  // if not found, create new channel with specified name and set its parent and topic
  channel = await guild.createChannel(name, 'text')
  config.discord.channels.set(topic, channel)
  channel.setParent(config.discord.category)
  channel.setTopic(topic)
  return channel
}
