import cleanTemporaryFiles from '../messenger/cleanTemporaryFiles'

const log = logger.withScope('discord:listener')

import { Message } from 'discord.js'
import { fromDiscord as createMessage } from '../createMessage'
import handleCommand from '../handleCommand'
import { sendMessage as sendDiscordMessage } from './'
import { sendMessage as sendMessengerMessage } from '../messenger'
import { checkIgnoredSequences, checkMKeep } from '../utils'

export default async (message: Message) => {
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
  {
    const data = await createMessage.toMessenger(message)
    Promise.all(threads.map(thread => sendMessengerMessage(thread, data)))
      .then(() => cleanTemporaryFiles(data))
  }
  {
    const channels = connection.getOtherWritableChannels(message.channel.id)
    const data = createMessage.toDiscord(message)
    channels.forEach(({ channel }) => sendDiscordMessage(channel!!, data))
  }
}
