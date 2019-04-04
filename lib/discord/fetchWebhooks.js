const log = logger.withScope('discord:login:fetchWebhooks')

module.exports = async () => {
  const guilds = discord.guilds.filter(guild => guild.channels.some(channel => connections.has(channel.id)))
  log.trace('used guilds', guilds, 1)

  // get all webhooks
  const webhooks = (await Promise.all(guilds.map(guild => guild.fetchWebhooks()))).reduce((a, b) => a.concat(b), [])
  discord.webhooks = webhooks.filter(webhook => webhook.name.startsWith('Miscord #'))

  log.trace('webhooks', discord.webhooks, 1)
}
