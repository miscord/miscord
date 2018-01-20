module.exports = async (guild, name) => {
	var channel = guild.channels.find(channel => channel.name === name)
	if (channel) return channel 
	return await guild.createChannel(name, "text")
}