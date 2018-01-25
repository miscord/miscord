module.exports = async (params) => {
  var { guild, name, parent, topic } = params

  // try searching by topic
  channel = guild.channels.find(channel => channel.topic === topic && channel.parentID === parent.id)
  // if found, change name and return
  if (channel) return channel.edit({ name })

  // if not found, create new channel with specified name and set its parent and topic
  channel = await guild.createChannel(name, 'text')
  channel.setParent(parent)
  channel.setTopic(topic)
  return channel
}
