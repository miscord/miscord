const log = logger.withScope('discord:login')

import { Client, CategoryChannel, Collection, DMChannel, TextChannel } from 'discord.js'
import FakeClient from '../dummy/discord'
import GuildArray from '../types/GuildArray'

export default () => {
  let client: Client | FakeClient
  if (config.discord.token === 'dummy') {
    client = new FakeClient()
  } else {
    client = new Client()
  }

  // log in to discord
  log.start('Logging in to Discord...')
  return client.login(config.discord.token).then(async () => {
    log.success('Logged in to Discord')
    global.discord = {
      client,
      guilds: new GuildArray(...client.guilds.array()),
      channels: {},
      webhooks: new Collection(),
      getChannel (id: string) {
        return client.channels.get(id) as TextChannel
      }
    }

    // if bot isn't added to any guilds, send error
    if (client.guilds.size === 0 && client instanceof Client) {
      throw new Error(`No guilds added!
You can add a bot to your guild here:
https://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=537390096&scope=bot
It's not an error... unless you added the bot to your guild already.`)
    }

    // set guild as a global variable, if it's specified in arguments then get it by name, if not then get the first one
    if (config.discord.guild) {
      const guild = client.guilds.find(guild => guild.name.toLowerCase() === config.discord.guild.toLowerCase() || guild.id === config.discord.guild)
      if (!guild) throw new Error(`Guild ${config.discord.guild} was not found!`)
      // move OUR guild to the front.
      discord.guilds = new GuildArray(
        guild,
        ...discord.guilds.filter(_guild => _guild.id !== guild.id)
      )
    }

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
      discord.category = category as CategoryChannel
    }

    log.debug('Got Discord channels list')

    discord.channels = {}

    if (config.channels.error) {
      if (!Array.isArray(config.channels.error)) config.channels.error = [ config.channels.error ]
      discord.channels.error = await getChannels(client, config.channels.error)
    }

    if (config.channels.command) {
      if (!Array.isArray(config.channels.command)) config.channels.command = [ config.channels.command ]
      discord.channels.command = await getChannels(client, config.channels.command)
    }

    client.on('error', (err: Error) => { throw err })

    return client
  })
}
async function getChannels (client: Client | FakeClient, channels: string[]): Promise<(TextChannel | DMChannel)[]> {
  return (
    await Promise.all(channels.map(id => getChannel(client, id)))
  ).filter(Boolean) as (TextChannel | DMChannel)[]
}
async function getChannel (client: Client | FakeClient, channelID: string): Promise<TextChannel | DMChannel | undefined> {
  if (discord.client.users.has(channelID)) return client.users.get(channelID)!!.createDM()
  if (discord.client.channels.has(channelID)) return client.channels.get(channelID) as TextChannel | DMChannel
  log.warn(`Channel/user ${channelID} not found.`)
}
