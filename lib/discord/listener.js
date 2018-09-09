const log = require('npmlog')
const url = require('url')

const { createMessage } = require('../messenger')
const handleCommand = require('../handleCommand')
const sendMessage = require('./sendMessage')

module.exports = async message => {
  log.info('discordListener', 'Got a Discord message')
  log.silly('discordListener: message', message)

  if (message.cleanContent.toLowerCase().startsWith('m!keep')) return

  // don't want to echo bot's messages
  if (discord.webhooks.has(message.author.id) || message.author.username === discord.client.user.username) return log.verbose('discordListener', 'Message was sent by Miscord or its webhook')

  if (discord.commandChannel && message.channel.id === discord.commandChannel.id) {
    if (message.channel.type === 'dm') return handleCommand(message.content)
    if (message.mentions.users && message.mentions.users.has(discord.client.user.id)) {
      return handleCommand(message.content.replace(new RegExp(`<@!?${discord.client.user.id}>`), ''))
    }
  }

  // make sure this channel is meant for the bot
  if (!connections.has(message.channel.id)) return log.verbose('discordListener', 'Channel not found in bot\'s channel map')

  // get image url from discord embeds
  var imageUrl = message.embeds.length > 0
    ? (message.embeds[0].image
      ? message.embeds[0].image.url
      : (message.embeds[0].thumbnail
        ? message.embeds[0].thumbnail.url
        : undefined
      )
    )
    : undefined

  // build message with attachments provided
  const msg = {
    body: createMessage(message),
    attachment: await Promise.all([imageUrl].concat(message.attachments.map(attach => attach.url)).filter(el => el).map(getStreamFromURL))
  }
  log.silly('discordListener: message', msg)
  const threads = connections.getThreads(message.channel.id)
  log.verbose('discordListener: threads', threads)

  // send message to threads specified in the config/channel topic
  threads.forEach(threadID => messenger.client.sendMessage(msg, threadID, sentMessageCallback))

  const channels = (await connections.getChannels(message.channel.id)).filter(el => el.id !== message.channel.id)
  if (channels.length) {
    const m = [
      message.content,
      {
        embeds: message.embeds,
        username: message.author.username,
        avatarURL: message.author.avatarURL
      }
    ]
    channels.forEach(channel => sendMessage(channel, message.channel.name, m))
  }
}

function getStreamFromURL (attachURL) {
  return new Promise((resolve, reject) => require(url.parse(attachURL).protocol.replace(':', '')).get(attachURL, res => resolve(res)))
}

function sentMessageCallback (err, info) {
  log.verbose('discordListener', 'Sent message on Messenger')
  if (err) return require('../error')(err)
  if (info) log.silly('discordListener: sent message info', info)
}
