module.exports = async (guild, name, parent, topic) => {
  // try searching channel by the name
  var channel = guild.channels.find(channel => channel.name === name && channel.parentID === parent.id)
  // if found, return
  if (channel) return channel

  // if not found, try searching by topic
  channel = guild.channels.find(channel => channel.topic === topic && channel.parentID === parent.id)
  // if found, change name and return
  if (channel) return channel.edit({ name })

  // finally, create new channel with specified name and set its parent and topic
  channel = await guild.createChannel(name, 'text')
  channel.setParent(parent)
  channel.setTopic(topic)
  return channel
}
