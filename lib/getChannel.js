module.exports = async (guild, name, parent) => {
  var channel = guild.channels.find(channel => channel.name === name && channel.parent === parent)
  if (channel) return channel
  return guild.createChannel(name, 'text')
}
