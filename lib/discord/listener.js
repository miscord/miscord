const log = require('npmlog')
const url = require('url')
const sendError = require('../error')

const { createMessage } = require('../messenger')
const handleCommand = require('../handleCommand')

module.exports = async message => {
  log.info('discordListener', 'Got a Discord message')
  log.silly('discordListener: message', message)

  if (message.cleanContent.startsWith('m!keep')) return

  // don't want to echo bot's messages
  if (config.discord.webhooks.has(message.author.id) || message.author.username === config.discord.client.user.username) return log.verbose('discordListener', 'Message was sent by one of Miscord\'s webhooks')

  if (config.commandChannel && message.channel.id === config.commandChannel.id) {
    if (message.channel.type === 'dm') return handleCommand(message.content)
    if (message.mentions.users && message.mentions.users.has(config.discord.client.user.id)) {
      return handleCommand(message.content.replace(new RegExp(`<@!?${config.discord.client.user.id}>`), ''))
    }
  }

  // make sure this channel is meant for the bot
  if (!config.channels.has(message.channel.id)) return log.verbose('discordListener', 'Channel not found in bot\'s channel map')

  // copy message content to a new variable, as the cleanContent property is read-only
  var content = message.cleanContent
  log.verbose('discordListener: clean content', content)

  // parse embed into plaintext
  if (message.embeds.length > 0 && !config.messenger.ignoreEmbeds) {
    message.embeds.forEach(embed => {
      if (embed.title) content += '\n' + embed.title
      if (embed.url && !content.includes(embed.url)) content += '\n(' + embed.url + ')'
      if (embed.description) content += '\n' + embed.description
      embed.fields.forEach(field => { content += '\n\n' + field.name + '\n' + field.value })
    })
    log.verbose('discordListener: content with embed', content)
  }

  // get image url from discord embeds
  var imageUrl = (message.embeds.length > 0 ? (message.embeds[0].image ? message.embeds[0].image.url : (message.embeds[0].thumbnail ? message.embeds[0].thumbnail.url : undefined)) : undefined)

  // build message with attachments provided
  var username = message.member ? (message.member.nickname || message.author.username) : message.author.username
  log.verbose('discordListener: username', username)
  var msg = {
    body: createMessage(username, content),
    attachment: await Promise.all([imageUrl].concat(message.attachments.map(attach => attach.url)).filter(el => el).map(getStreamFromURL))
  }
  log.silly('discordListener: message', msg)
  var threads = config.channels.getThreadIDs(message.channel.id)
  log.verbose('discordListener: threads', threads)

  // send message to threads specified in the config/channel topic
  threads.forEach(threadID => config.messenger.client.sendMessage(msg, threadID, (err, info) => sentMessageCallback(err, info, threadID, msg)))
}

function getStreamFromURL (attachURL) {
  return new Promise((resolve, reject) => require(url.parse(attachURL).protocol.replace(':', '')).get(attachURL, res => resolve(res)))
}

function sentMessageCallback (err, info, threadID, message) {
  log.verbose('discordListener', 'Sent message on Messenger')
  if (err) {
    if (err.code === 'ESOCKETTIMEDOUT') {
      return config.messenger.client.sendMessage(message, threadID, (err, info) => sentMessageCallback(err, info, threadID, message))
    } else sendError(err)
  }
  if (info) log.silly('discordListener: sent message info', info)
}
