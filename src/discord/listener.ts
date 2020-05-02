import cleanTemporaryFiles from '../messenger/cleanTemporaryFiles'
import { Message } from 'discord.js'
import { fromDiscord as createMessage } from '../createMessage'
import handleCommand from '../handleCommand'
import { sendMessage as sendDiscordMessage } from './'
import { sendMessage as sendMessengerMessage } from '../messenger'
import { checkIgnoredSequences, checkMKeep } from '../utils'

const log = logger.withScope('discord:listener')

export default async function handleMessage (message: Message): Promise<void> {
  if (config.paused) {
    log.info('Got a Discord messenger (paused)')
    return
  }

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

  // send message to threads specified in the connections
  if (message.type === 'PINS_ADD' && !config.messenger.sendPinned) {
    log.debug('"pinned" messages are disabled, ignoring')
  } else {
    const threads = connection.getWritableThreads()
    const data = await createMessage.toMessenger(message)
    Promise.all(threads.map(thread => sendMessengerMessage(thread, data)))
      .then(() => cleanTemporaryFiles(data))
      .catch(err => log.error(err))
  }
  {
    const channels = connection.getOtherWritableChannels(message.channel.id)
    const data = createMessage.toDiscord(message)
    channels.map(endpoint => sendDiscordMessage(endpoint.id, data))
  }
}
