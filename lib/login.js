const Discord = require('discord.js')
const Messenger = require('facebook-chat-api')
const fs = require('fs')
const sendError = require('./error.js')
const getChannel = require('./getChannel.js')
const getEnvConfig = require('./getEnvConfig.js')
const discord = new Discord.Client()
var loggedin = false

function getAPI (config, guild) {
  return new Promise((resolve, reject) => {
    var obj
    try {
      obj = {appState: require('../appstate.json')}
    } catch (err) {
      obj = {email: config.facebook.username, password: config.facebook.password}
    }
    var options = {forceLogin: config.facebook.forceLogin}
    Messenger(obj, options, (err, api) => {
      if (err) {
        if (err.error !== 'login-approval') return reject(err)
        getChannel({
          guild: guild,
          name: 'login-approval',
          config: config,
          topic: 'channel made for codes from login approval'
        }).then(channel => channel.send('Enter code:')).catch(sendError)
        discord.on('message', message => {
          if (loggedin || message.channel.name !== 'login-approval' || message.author.username === discord.user.username || message.channel.parent.name !== config.discord.category.name) return
          err.continue(message.content)
          message.channel.send('Code accepted.')
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
  return discord.login(config.discord.token).then(async u => {
    // if bot isn't added to any guilds, send error
    if (discord.guilds.size === 0) sendError('No guilds added!')

    // set guild as a global variable, if it's specified in arguments then get it by name, if not then get the first one
    var guild = config.discord.guild ? discord.guilds.get(config.discord.guild) : discord.guilds.first()

    // if guild is undefined, send error
    if (!guild) sendError('Guild not found!')

    // get category and list of channels
    var category = guild.channels.find(channel => channel.name === config.discord.category && channel.type === null)
    if (!category) category = await guild.createChannel(config.discord.category, 'category')
    config.discord.category = category
    config.discord.channels = new Map()
    category.children.forEach(channel => config.discord.channels.set(channel.topic, channel))

    return getAPI(config, guild).then(facebook => {
      return {facebook, discord, guild, config}
    })
  })
}

function getConfig () {
  var config
  try {
    config = require('../config.json')
    if (!config.discord.token || !config.facebook.username || !config.facebook.password) {
      config = getEnvConfig()
    }
  } catch (err) {
    config = getEnvConfig()
  }

  // if any of the optional values is undefined, return default value
  return {
    facebook: {
      username: config.facebook.username,
      password: config.facebook.password,
      forceLogin: config.facebook.forceLogin || false,
      showUsername: config.facebook.showUsername || config.discord.showUsername || true,
      boldUsername: config.facebook.boldUsername || false,
      filter: {
        whitelist: config.facebook.filter.whitelist || [],
        blacklist: config.facebook.filter.blacklist || []
      }
    },
    discord: {
      token: config.discord.token,
      guild: config.discord.guild,
      category: config.discord.category || 'messenger',
      sendNotifications: config.discord.sendNotifications || true
    }
  }
}
