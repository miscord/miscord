const Discord = require('discord.js')
const Messenger = require('facebook-chat-api')
const fs = require('fs')
const util = ('util')
const readline = require('readline')
const sendError = require('./lib/error.js')
const removeAccents = require('remove-accents')

var rl = readline.createInterface({input: process.stdin, output: process.stdout})

const discord = new Discord.Client()

// log in to discord
discord.login(process.env.DISCORD_TOKEN).then(u => {
	// if bot isn't added to any guilds, send error
	if (discord.guilds.size === 0) sendError('No guilds added!')

	// set guild as a global variable, if it's specified in arguments then get it by name, if not then get the first one
	guild = process.argv[2] ? discord.guilds.get(process.argv[2]) : discord.guilds.first()
	
	// if guild is undefined, send error
	if (!guild) sendError('Guild not found!')
})

// log in to messenger
Messenger({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, {forceLogin: process.env.FORCE_LOGIN}, (err,api) => {
	if(err) {
		// if login approval is needed, enter authenticator code
		if (err.error !== 'login-approval') return console.error(err)
		console.log('Enter code: ')
		rl.on('line', line => {
			err.continue(line)
			rl.close()
		})
	}
	// don't spam with unnecessary debug messages
	api.setOptions({ logLevel: "silent" })
	
	// when got a discord message
	discord.on("message", message => {
		// don't want to echo bot's messages
		if (message.author.username === discord.user.username) return

		// make sure this channel is meant for the bot
		if (!parseInt(message.channel.topic, 10).toString() === message.channel.topic) return

		// build message with attachments provided
		var msg = message.attachments.size > 0 ? {body: message.content, url: message.attachments.first().url} : {body: message.content}
		
		// send message to thread with ID specified in topic
		api.sendMessage(msg, message.channel.topic)
	})

	// when got a facebook message
	api.listen((err, message) => {
		if(err) return console.error(err)
		// get thread info to know if it's a group conversation
		api.getThreadInfoGraphQL(message.threadID, (err, thread) => {
			if (err) return console.error(err)
			// also get sender info because we need it if it's a group
			api.getUserInfo(message.senderID, (err, sender) => {
				if (err) return console.error(err)
				// clean name for the needs of discord channel naming
				var cleanname = removeAccents(thread.name).replace(' ', '-').replace(/\W-/g, '').toLowerCase()

				// build message from template
				var m = createMessage(thread, sender[message.senderID], message)

				// find the discord channel
				var channel = guild.channels.find(channel => channel.name === cleanname)
				if (channel) {
					// if channel exists then message is sent to this channel
					channel.send(m)
				} else {
					guild.createChannel(cleanname, "text").then(channel => {
						// otherwise that channel is created, topic is set to thread ID and message is sent to this channel
						channel.setTopic(message.threadID)
						channel.send(m) 
					})
				}
			})
		})
	})
})

// function creating message from template
function createMessage (thread, sender, message) {
	if (thread.isCanonical) {
		// if it's a group:
		// if there are no attachments, return plaintext message
		if (message.attachments.length === 0) return message.body
		var attach = message.attachments[0]

		// if there are attachments, set title to message body
		var embed = new Discord.RichEmbed().setTitle(message.body)

		// if it's image, then embed it
		if (attach.type === 'photo') return embed.setImage(message.attachments[0].url)

		// if it's not image, simply attach file
		return embed.attachFile(attach.url)
	} else {
		var attach = message.attachments
		// set description to message body, set author to message sender
		var embed = new Discord.RichEmbed().setDescription(message.body).setAuthor(sender.name, sender.thumbSrc)

		// if there are no attachments, send it already
		if (attach.length === 0) return embed

		// if it's image, then embed it
		if (attach[0].type === 'photo') return embed.setImage(attach[0].url)
		
		// if it's not image, simply attach file
		return embed.attachFile(attach.url)
	}
}
