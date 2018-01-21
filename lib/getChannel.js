module.exports = async (guild, name, parent) => {
  var channel = guild.channels.find(channel => channel.name === name && channel.parent === parent)
  if (channel) return channel
  channel = await guild.createChannel(name, 'text')
  channel.setParent(parent)
  return channel
}
