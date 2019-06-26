import handleMentions from './handleMentions'

const log = logger.withScope('discord:sendMessage')

import { DiscordMessageData } from '../createMessage/MessageData'

export default async (channelId: string, { body, opts }: DiscordMessageData, image?: string) => {
  // check if body is empty and there are no files
  if (!body && !(opts.files && opts.files.length)) return log.warn('Not sending message, empty.')

  // get channel
  const channel = discord.getChannel(channelId)

  // handle mentions
  body = handleMentions(body, channel)

  // find / create a webhook
  let webhook = discord.webhooks.find(webhook => webhook.channelID === channel.id)
  if (!webhook) {
    const myself = channel.guild.members.find(member => member.id === discord.client.user.id)
    if (!myself.hasPermission('MANAGE_WEBHOOKS')) {
      log.warn(`Bot doesn't have permissions to post in channel #${channel.name} (${channel.id})`)
      return
    }

    webhook = await channel.createWebhook(`Miscord #${channel.name}`.substr(0, 32), image || 'https://miscord.net/img/icon.png')
    discord.webhooks.set(webhook.id, webhook)
  }
  log.trace('webhook', { webhook }, 1)

  log.debug('Sending the message')
  const sentMessage = await webhook.send(body, opts)

  log.debug('Sent message on Discord')
  log.trace('sent message', { sentMessage }, 1)

  return sentMessage
}
