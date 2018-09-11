const log = require('npmlog')

module.exports = async (channel, cleanname, m, image = 'https://miscord.net/img/icon.png') => {
  // find / create a webhook
  let webhook = discord.webhooks.find(webhook => webhook.channelID === channel.id)
  if (!webhook) {
    webhook = await channel.createWebhook(`Miscord #${cleanname}`.substr(0, 32), image)
    discord.webhooks.set(webhook.id, webhook)
  }
  log.silly('messengerListener: webhook', webhook)

  log.verbose('messengerListener', 'Sending the message')
  const sentMessage = await webhook.send(...m)

  log.verbose('messengerListener', 'Sent message on Discord')
  log.silly('messengerListener: sent message', sentMessage)

  return sentMessage
}
