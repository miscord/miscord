const Discord = require('discord.js')
const Messenger = require('facebook-chat-api')
const fs = require('fs')
const sendError = require('./error.js')
const getChannel = require('./getChannel.js')
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
    var options = {forceLogin: config.facebook.force}
    Messenger(obj, options, (err, api) => {
      if (err) {
        if (err.error !== 'login-approval') return reject(err)
        getChannel({
          client: discord,
          name: 'login-approval',
          config: config,
          topic: 'channel made for codes from login approval'
        }).then(channel => channel.send('Enter code:')).catch(sendError)
        discord.on('message', message => {
          if (loggedin || message.channel.name !== 'login-approval' || message.author.username === discord.user.username) return
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
    var category = guild.channels.find(channel => channel.name === (config.discord.category || 'messenger') && channel.type === null)
    if (!category) category = await guild.createChannel(config.discord.category || 'messenger', 'category')
    config.discord.category = category
    config.discord.channels = new Map()
    category.children.forEach(channel => config.discord.channels.set(channel.topic, channel))

    return getAPI(config, guild).then(facebook => {
      return {facebook, discord, guild, config}
    })
  })
}

function getConfig () {
  try {
    var config = require('../config.json')
  } catch (err) {
    return getEnvConfig()
  }
  if (!config.discord.token || !config.facebook.username || !config.facebook.password) {
    return getEnvConfig()
  }
  return config
}

function getEnvConfig () {
  var envconfig = {
    discord: {
      token: process.env.DISCORD_TOKEN,
      guild: process.env.DISCORD_GUILD,
      category: process.env.DISCORD_CATEGORY,
      showUsername: process.env.DISCORD_SHOW_USERNAME
    },
    facebook: {
      username: process.env.FACEBOOK_USERNAME,
      password: process.env.FACEBOOK_PASSWORD,
      force: process.env.FACEBOOK_FORCELOGIN
    }
  }
  if (!envconfig.discord.token || !envconfig.facebook.username || !envconfig.facebook.password) {
    sendError('Failed to get config information')
  }
  return envconfig
}
