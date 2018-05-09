const log = require('npmlog')
const sendError = require('../error')

const { createMessage } = require('../messenger')

module.exports = opts => {
  try {
    var { message, config } = opts

    log.info('discordListener', 'Got a Discord message')
    log.silly('discordListener: message', message)

    // don't want to echo bot's messages
    if (config.discord.webhooks.has(message.author.id) || message.author.username === config.discord.client.user.username) return log.verbose('discordListener', 'Message was sent by one of Miscord\'s webhooks')

    // make sure this channel is meant for the bot
    if (!config.discord.channels.find('id', message.channel.id)) return log.verbose('discordListener', 'Channel not found in bot\'s channel map')

    // copy message content to a new variable, as the cleanContent property is read-only
    var content = message.cleanContent
    log.verbose('discordListener: clean content', content)

    // parse embed into plaintext
    if (message.embeds.length > 0 && !config.messenger.ignoreEmbeds) {
      message.embeds.forEach(embed => {
        if (embed.title) content += '\n' + embed.title
        if (embed.url) content += '\n(' + embed.url + ')'
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
      body: createMessage(config, username, content),
      url: message.attachments.size > 0 ? message.attachments.first().url : imageUrl
    }
    if (config.messenger.separateImages) msg = [ { body: msg.body }, { url: msg.url } ]
    log.silly('discordListener: message', msg)
    var threadID = ([...config.discord.channels].find(([, v]) => v.id === message.channel.id) || [])[0] || message.channel.topic
    log.verbose('discordListener: threadID', threadID)

    // find link if exists
    var link = Object.entries(config.messenger.link).find(entry => entry.reduce((acc, val) => acc.concat(val), []).includes(threadID))
    var threads = link.reduce((acc, val) => acc.concat(val), []) || [threadID]

    // send message to threads specified in the config/channel topic
    threads.forEach(threadID => {
      if (!config.messenger.separateImages) {
        config.messenger.client.sendMessage(msg, threadID, sentMessageCallback)
      } else {
        config.messenger.client.sendMessage(msg[0], threadID, sentMessageCallback)
        // if the image exists
        if (msg[1].url) config.messenger.client.sendMessage(msg[1], threadID, sentMessageCallback)
      }
    })
  } catch (e) {
    sendError(e)
  }
}

function sentMessageCallback (err, info) {
  if (err) log.error('discordListener', err)
  if (info) log.silly('discordListener: sent message info', info)
}
