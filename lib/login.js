const Discord = require('discord.js')
const Messenger = require('facebook-chat-api')
const fs = require('fs')
const sendError = require('./error.js')
const getChannel = require('./getChannel.js')
const getConfig = require('./getConfig.js')
const updateNotifier = require('./updateNotifier.js')
const discord = new Discord.Client()
const log = require('npmlog')
var loggedin = false

function getAPI (config, guild) {
  return new Promise((resolve, reject) => {
    var obj
    try {
      obj = {appState: require('../appstate.json')}
    } catch (err) {
      obj = {email: config.facebook.username, password: config.facebook.password}
    }
    var options = {forceLogin: config.facebook.forceLogin, logLevel: 'warn'}
    Messenger(obj, options, (err, api) => {
      log.info('login', 'Logging in to Facebook...')
      if (err) {
        if (err.error !== 'login-approval') return reject(err)
        log.info('Login approval pending...')
        getChannel({
          guild: guild,
          name: 'login-approval',
          config: config,
          topic: 'channel made for codes from login approval'
        }).then(channel => channel.send('Enter code:')).catch(sendError)
        discord.on('message', message => {
          if (loggedin || message.channel.name !== 'login-approval' || message.author.username === discord.user.username || message.channel.parent.name !== config.discord.category.name) return
          log.verbose('login', 'Got FB approval code: %s', message.content)
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
  log.info('login', 'Logging in...')
  var config = getConfig()
  log.info('login', 'Log level: %s', config.logLevel)
  log.level = config.logLevel

  // check for updates if enabled in the config
  if (config.checkUpdates) await updateNotifier()

  // log in to discord
  log.info('login', 'Logging in to Discord...')
  return discord.login(config.discord.token).then(async u => {
    log.info('login', 'Logged in to Discord')

    // if bot isn't added to any guilds, send error
    log.silly('login: discord guilds', discord.guilds)
    if (discord.guilds.size === 0) sendError('No guilds added!')

    // set guild as a global variable, if it's specified in arguments then get it by name, if not then get the first one
    var guild = config.discord.guild ? discord.guilds.get(config.discord.guild) : discord.guilds.first()
    log.silly('login', 'Discord guild: %s', guild)

    // if guild is undefined, send error
    if (!guild) sendError('Guild not found!')
    log.verbose('login', 'Found Discord guild')

    // get category and list of channels
    var category = guild.channels.find(channel => channel.name === config.discord.category && channel.type === null)
    if (!category) category = await guild.createChannel(config.discord.category, 'category')
    log.verbose('login', 'Got Discord category')
    log.silly('login', category)
    config.discord.category = category
    config.discord.channels = new Map()
    category.children.forEach(channel => config.discord.channels.set(channel.topic, channel))

    log.info('login', 'Got Discord channels list')

    return getAPI(config, guild).then(facebook => {
      log.info('login', 'Logged in')
      return {facebook, discord, guild, config}
    })
  })
}
