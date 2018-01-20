const Discord = require('discord.js')
const Messenger = require('facebook-chat-api')
const fs = require("fs")
const showError = require('./error.js')
const getChannel = require('./getChannel.js')
const discord = new Discord.Client()
var loggedin = false

function getAPI (config, guild) {
	return new Promise((resolve, reject) => {
		var obj
		try {
			obj = {appState: require('../appstate.json')}
		} catch(err) {
			obj = {email: config.facebook.username, password: config.facebook.password}
		}
		var options = {forceLogin: config.facebook.force}
		Messenger(obj, options, (err, api) => {
			if (err) {
				if (err.error !== 'login-approval') return reject(err)
				getChannel(guild, 'login-approval').then(channel => channel.send('Enter code:'))
				discord.on('message', message => {
					if(loggedin || message.channel.name !== 'login-approval' || message.author.username === discord.user.username) return
					err.continue(message.content)
					loggedin = true
				})
				return
			}
			fs.writeFile('appstate.json', JSON.stringify(api.getAppState()), e => resolve(api))
		})
	})
}

module.exports = async () => {
	var config = getConfig()
	// log in to discord
	return discord.login(config.discord.token).then(u => {
		// if bot isn't added to any guilds, send error
		if (discord.guilds.size === 0) sendError('No guilds added!')

		// set guild as a global variable, if it's specified in arguments then get it by name, if not then get the first one
		var guild = config.discord.guild ? discord.guilds.get(config.discord.guild) : discord.guilds.first()

		// if guild is undefined, send error
		if (!guild) sendError('Guild not found!')

		return getAPI(config, guild).then(api => {
			return {api, discord, guild}
		})
	})
}

function getConfig () {
	var config = require('../config.json')
	if (config.discord.token === '' || config.facebook.username === '' || config.facebook.password === '') {
		if (process.env.DISCORD_TOKEN === '' || process.env.FACEBOOK_USERNAME === '' || process.env.FACEBOOK_PASSWORD === '') {
			showError('Failed to get config information')
		}
		return {
			discord: {
				token: process.env.DISCORD_TOKEN,
				guild: process.env.DISCORD_GUILD,
			},
			facebook: {
				username: process.env.FACEBOOK_USERNAME,
				password: process.env.FACEBOOK_PASSWORD,
				force: process.env.FACEBOOK_FORCELOGIN
			}
		}
	}
	return config
}