const Discord = require('discord.js')
const Messenger = require('facebook-chat-api')
const fs = require('fs')
const util = ('util')
const sendError = require('./lib/error.js')
const removeAccents = require('remove-accents')

const discord = new Discord.Client()
discord.login(process.env.DISCORD_TOKEN).then(u => {
    if (discord.guilds.size === 0) sendError('No guilds added!')
	guild = process.argv[2] ? discord.guilds.get(process.argv[2]) : discord.guilds.first()
	if (!guild) sendError('Guild not found!')
})

Messenger({email: process.env.LOGIN, password: process.env.PASSWORD}, (err,api) => {
	if(err) return console.error(err)
    api.setOptions({ logLevel: "silent" })
	discord.on("message", message => {
		if (message.author.username === discord.user.username) return
		api.sendMessage({body: message.content}, message.channel.topic)
	})
    api.listen((err, message) => {
		if(err) return console.error(err)
		api.getThreadInfo(message.threadID, (err, thread) => {
			if (err) return console.error(err)
			api.getUserInfo(message.senderID, (err, sender) => {
				if (err) return console.error(err)
				var cleanname = removeAccents(thread.name).replace(' ', '-').replace(/\W-/g, '').toLowerCase()
				var m = createMessage(thread, sender[message.senderID], message)
				var channel = guild.channels.find(channel => channel.name === cleanname)
				if (channel) {
					channel.send(m)
				} else {
					guild.createChannel(cleanname, "text").then(channel => {
						channel.setTopic(message.threadID)
						channel.send(m) 
					})
				}
			})
		})
    })
})

function createMessage (thread, sender, message) {
	if (thread.isCanonical) {
		if (message.attachments.length === 0) return message.body
		var attach = message.attachments[0]
		var embed = new Discord.RichEmbed().setTitle(message.body)
		if (attach.type === 'photo') return embed.setImage(message.attachments[0].url)
		return embed.attachFile(attach.url)
	} else {
		var attach = message.attachments
		var embed = new Discord.RichEmbed().setDescription(message.body).setAuthor(sender.name, sender.thumbSrc)
		if (attach.length === 0) return embed
		if (attach[0].type === 'photo') return embed.setImage(attach[0].url)
		return embed.attachFile(attach.url)
	}
	console.log(message)
	return 'wyjebalo'
}
