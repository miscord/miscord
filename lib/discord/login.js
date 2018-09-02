const log = require('npmlog')
const Discord = require('discord.js')
const client = new Discord.Client()
const ConnectionsManager = require('../ConnectionsManager')

module.exports = () => {
  // log in to discord
  log.info('login', 'Logging in to Discord...')
  return client.login(config.discord.token).then(async u => {
    // log.silly('login: discord client', client)
    log.info('login', 'Logged in to Discord')
    global.discord = {}
    discord.client = client

    // set activity
    client.user.setActivity('Miscord v' + require('../../package.json').version)

    // if bot isn't added to any guilds, send error
    log.silly('login: guilds', client.guilds)
    if (client.guilds.size === 0) {
      throw new Error(`No guilds added!
You can add a bot to your guild here:
https://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=537390096&scope=bot
It's not an error... unless you added the bot to your guild already.`)
    }

    // set guild as a global variable, if it's specified in arguments then get it by name, if not then get the first one
    if (config.discord.guild) {
      const guild = client.guilds.find(guild => guild.name.toLowerCase() === config.discord.guild.toLowerCase() || guild.id === config.discord.guild)
      if (!guild) throw new Error(`Guild ${config.discord.guild} was not found!`)
      discord.guilds = [ guild ]
    } else {
      discord.guilds = client.guilds.array()
    }
    discord.guilds.getAll = name => [].concat(...discord.guilds.map(guild => guild[name].array()))
    log.verbose('login', 'Found Discord guild(s)')
    log.silly('login: guilds', discord.guilds)

    // if user put category name in the config
    if (config.discord.category) {
      // get category
      var category = config.discord.guilds[0].channels.find(channel =>
        (channel.name.toLowerCase() === config.discord.category.toLowerCase() || channel.id === config.discord.category) &&
        (channel.type === null || channel.type === 'category')
      )
      // if category is missing, crash
      if (!category) throw new Error(`Category ${config.discord.category} was not found!`)
      log.verbose('login', 'Got Discord category')
      log.silly('login', category)
      discord.category = category
    }

    global.channels = new ConnectionsManager()

    // get all webhooks
    const webhooks = (await Promise.all(discord.guilds.map(guild => guild.fetchWebhooks()))).reduce((a, b) => a.concat(b))
    discord.webhooks = webhooks.filter(webhook => webhook.name.startsWith('Miscord #'))

    log.silly('login: channels', config.discord.channels)

    log.info('login', 'Got Discord channels list')

    if (config.errorChannel) {
      if (client.users.has(config.errorChannel)) {
        discord.errorChannel = await client.users.get(config.errorChannel).createDM()
      } else if (client.channels.has(config.errorChannel)) {
        discord.errorChannel = client.channels.get(config.errorChannel)
      } else {
        log.warn('login', `Error channel/user ${config.errorChannel} not found.`)
      }
    }

    if (config.commandChannel) {
      if (client.users.has(config.commandChannel)) {
        discord.commandChannel = await client.users.get(config.commandChannel).createDM()
      } else if (client.channels.has(config.commandChannel)) {
        discord.commandChannel = client.channels.get(config.commandChannel)
      } else {
        log.warn('login', `Command channel/user ${config.commandChannel} not found.`)
      }
    }

    client.on('error', err => log.error('discord', err))

    return client
  })
}
