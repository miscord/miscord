const log = require('npmlog')
const url = require('url')

const { createMessage } = require('../messenger')
const handleCommand = require('../handleCommand')

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
  if (!channels.has(message.channel.id)) return log.verbose('discordListener', 'Channel not found in bot\'s channel map')

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
  var threads = channels.getThreadIDs(message.channel.id)
  log.verbose('discordListener: threads', threads)

  // send message to threads specified in the config/channel topic
  threads.forEach(threadID => messenger.client.sendMessage(msg, threadID, sentMessageCallback))
}

function getStreamFromURL (attachURL) {
  return new Promise((resolve, reject) => require(url.parse(attachURL).protocol.replace(':', '')).get(attachURL, res => resolve(res)))
}

function sentMessageCallback (err, info) {
  log.verbose('discordListener', 'Sent message on Messenger')
  if (err) return require('../error')(err)
  if (info) log.silly('discordListener: sent message info', info)
}
