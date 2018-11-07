const log = logger.withScope('discord:sendMessage')

module.exports = async (channel, body, opts, image) => {
  // find / create a webhook
  let webhook = discord.webhooks.find(webhook => webhook.channelID === channel.id)
  if (!webhook) {
    webhook = await channel.createWebhook(`Miscord #${channel.name}`.substr(0, 32), image || 'https://miscord.net/img/icon.png')
    discord.webhooks.set(webhook.id, webhook)
  }
  log.trace('webhook', webhook)

  log.debug('Sending the message')
  const sentMessage = await webhook.send(body, opts)

  log.debug('Sent message on Discord')
  log.trace('sent message', sentMessage, 1)

  return sentMessage
}
