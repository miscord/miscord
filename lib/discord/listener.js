const log = logger.withScope('discord:listener')

const createMessage = require('../createMessage').fromDiscord
const handleCommand = require('../handleCommand')
const sendMessage = require('./sendMessage')

module.exports = async message => {
  log.info('Got a Discord message')
  log.trace('message', message, 1)

  if (message.cleanContent.toLowerCase().startsWith('m!keep')) return

  // don't want to echo bot's messages
  if (discord.webhooks.has(message.author.id) || message.author.username === discord.client.user.username) return log.debug('Message was sent by Miscord or its webhook')

  if (discord.channels.command && message.channel.id === discord.channels.command.id) {
    if (message.channel.type === 'dm') return handleCommand(message.content, message.author)
    if (message.mentions.users && message.mentions.users.has(discord.client.user.id)) {
      return handleCommand(message.content.replace(new RegExp(`<@!?${discord.client.user.id}>`), ''), message.author)
    }
  }

  // make sure this channel is meant for the bot
  if (!connections.has(message.channel.id)) return log.debug('Channel not found in bot\'s channel map')

  // find threads by channel ID
  const threads = connections.getThreads(message.channel.id).filter(el => !el.readonly)
  log.trace('threads', threads)

  // send message to threads specified in the config/channel topic
  threads.forEach(async thread => {
    const { body, attachments } = await createMessage.messenger(message)
    if (body && body.trim()) {
      log.debug('Sending Messenger message')
      const info = await messenger.client.sendMessage(Number(thread.id), body.toString())
      log.trace('sent message info', info)
      if (!info.succeeded) message.channel.send(info.errStr, { code: true })
      log.debug('Sent message on Messenger')
    }
    if (attachments) {
      log.debug('Sending Messenger attachments')
      const info = await Promise.all(attachments.map(attachment => messenger.client.sendAttachmentStream(thread.id, attachment.extension, attachment.stream)))
      log.trace('sent attachments info', info)
      log.debug('Sent Messenger attachments')
    }
  })

  const channels = (await connections.getChannels(message.channel.id)).filter(el => el.id !== message.channel.id)
  if (channels.length) {
    const { body, opts } = createMessage.discord(message)
    channels.forEach(channel => sendMessage(channel, body, opts))
  }
}
