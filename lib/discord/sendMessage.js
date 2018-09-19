const log = logger.withScope('discord:sendMessage')

module.exports = async (channel, cleanname, m, image = 'https://miscord.net/img/icon.png') => {
  // find / create a webhook
  let webhook = discord.webhooks.find(webhook => webhook.channelID === channel.id)
  if (!webhook) {
    webhook = await channel.createWebhook(`Miscord #${cleanname}`.substr(0, 32), image)
    discord.webhooks.set(webhook.id, webhook)
  }
  log.trace('webhook', toStr(webhook))

  log.debug('Sending the message')
  const sentMessage = await webhook.send(...m)

  log.debug('Sent message on Discord')
  log.trace('sent message', toStr(sentMessage, 1))

  return sentMessage
}
