const log = logger.withScope('discord:listener')

const createMessage = require('../createMessage').fromDiscord
const handleCommand = require('../handleCommand')
const sendMessage = require('./sendMessage')
const fs = require('fs-extra')
const { checkMKeep, checkIgnoredSequences } = require('../utils')

module.exports = async message => {
  log.info('Got a Discord message')
  log.trace('message', message, 1)

  if (checkMKeep(message.cleanContent)) return log.debug('m!keep received, ignoring.')
  if (config.discord.ignoreBots && message.author.bot) return log.debug('config.discord.ignoreBots enabled and author is a bot.')
  if (Array.isArray(config.discord.ignoredUsers) && config.discord.ignoredUsers.includes(message.author.id)) return log.debug('author is in config.discord.ignoredUsers.')

  // don't want to echo bot's messages
  if (discord.webhooks.has(message.author.id) || message.author.username === discord.client.user.username) return log.debug('Message was sent by Miscord or its webhook')

  if (Array.isArray(discord.channels.command) && discord.channels.command.some(channel => channel.id === message.channel.id)) {
    if (message.channel.type === 'dm') return handleCommand(message)
    if (message.mentions.users && message.mentions.users.has(discord.client.user.id)) {
      message.content = message.content.replace(new RegExp(`<@!?${discord.client.user.id}>`), '')
      return handleCommand(message)
    }
  }

  if (checkIgnoredSequences(message.cleanContent)) return log.debug('found an ignored sequence, ignoring.')

  // make sure this channel is meant for the bot
  const connection = connections.getWith(message.channel.id)
  if (!connection) return log.debug('Channel not found in bot\'s connections')

  // find threads by channel ID
  const threads = connection.getWritableThreads()
  log.trace('threads', threads)

  // send message to threads specified in the connections
  const { body, attachments } = await createMessage.messenger(message)
  Promise.all(threads.map(async thread => {
    if (body && body.trim()) {
      log.debug('Sending Messenger message')
      const info = await messenger.client.sendMessage(Number(thread.id), body.toString())
      log.trace('sent message info', info)
      if (!info.succeeded) message.channel.send(info.errStr, { code: true })
      log.debug('Sent message on Messenger')
    }
    if (attachments && attachments.length) {
      log.debug('Sending Messenger attachments')
      const info = await Promise.all(attachments.map(attachment => {
        return messenger.client.sendAttachmentFile(thread.id, attachment.filePath, attachment.extension)
      }))
      log.trace('sent attachments info', info)
      log.debug('Sent Messenger attachments')
    }
  })).then(async () => {
    if (attachments && attachments.length) {
      await Promise.all(attachments.map(attachment => fs.unlink(attachment.filePath)))
      log.debug('Removed temporary attachment files')
    }
  })

  const channels = connection.getOtherWritableChannels(message.channel.id)
  const { body: dBody, opts } = createMessage.discord(message)
  channels.forEach(({ channel }) => sendMessage(channel, dBody, opts))
}
