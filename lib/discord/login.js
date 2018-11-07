const log = logger.withScope('discord:login')
const Discord = require('discord.js')
const client = new Discord.Client()

module.exports = () => {
  // log in to discord
  log.start('Logging in to Discord...')
  return client.login(config.discord.token).then(async u => {
    log.success('Logged in to Discord')
    global.discord = {}
    discord.client = client

    // set activity
    client.user.setActivity('Miscord v' + require('../../package.json').version)

    // if bot isn't added to any guilds, send error
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
    log.debug('Found Discord guild(s)')
    log.trace('guilds', discord.guilds, 1)

    // if user put category name in the config
    if (config.discord.category) {
      // get category
      const category = discord.guilds[0].channels.find(channel =>
        (channel.name.toLowerCase() === config.discord.category.toLowerCase() || channel.id === config.discord.category) &&
        (channel.type === null || channel.type === 'category')
      )
      // if category is missing, crash
      if (!category) throw new Error(`Category ${config.discord.category} was not found!`)
      log.debug('Got Discord category')
      log.trace('category', category)
      discord.category = category
    }

    // get all webhooks
    const webhooks = (await Promise.all(discord.guilds.map(guild => guild.fetchWebhooks()))).reduce((a, b) => a.concat(b))
    discord.webhooks = webhooks.filter(webhook => webhook.name.startsWith('Miscord #'))

    log.trace('webhooks', discord.webhooks, 1)

    log.debug('Got Discord channels list')

    if (config.errorChannel) {
      config.channels.error = config.errorChannel
      config.errorChannel = null
    }
    if (config.commandChannel) {
      config.channels.command = config.commandChannel
      config.commandChannel = null
    }

    discord.channels = {}

    if (config.channels.error) {
      if (client.users.has(config.channels.error)) {
        discord.channels.error = await client.users.get(config.channels.error).createDM()
      } else if (client.channels.has(config.channels.error)) {
        discord.channels.error = client.channels.get(config.channels.error)
      } else {
        log.warn(`Error channel/user ${config.channels.error} not found.`)
      }
    }

    if (config.channels.command) {
      if (client.users.has(config.channels.command)) {
        discord.channels.command = await client.users.get(config.channels.command).createDM()
      } else if (client.channels.has(config.channels.command)) {
        discord.channels.command = client.channels.get(config.channels.command)
      } else {
        log.warn(`Command channel/user ${config.channels.command} not found.`)
      }
    }

    client.on('error', err => log.error(err))

    return client
  })
}
