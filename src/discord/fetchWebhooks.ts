const log = logger.withScope('discord:login:fetchWebhooks')

import { Collection } from 'discord.js'

export default async () => {
  const guilds = discord.guilds.filter(guild => guild.channels.some(channel => connections.has(channel.id)))
  log.trace('used guilds', guilds, 1)

  // get all webhooks
  const webhooks = (await Promise.all(guilds
    .filter(guild => {
      const myself = guild.members.find(member => member.id === discord.client.user.id)
      return myself.hasPermission('MANAGE_WEBHOOKS')
    })
    .map(guild => guild.fetchWebhooks())
  )).reduce((a, b) => a.concat(b), new Collection())
  discord.webhooks = webhooks.filter(webhook => webhook.name.startsWith('Miscord #'))

  log.trace('webhooks', discord.webhooks, 1)
}
