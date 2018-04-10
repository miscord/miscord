const log = require('npmlog')
const sendError = require('../error')

const { handleCustomEmoji } = require('../discord')

module.exports = opts => {
  try {
    var { message, config } = opts

    log.info('discordListener', 'Got a Discord message')
    log.silly('discordListener: message', message)
    // don't want to echo bot's messages
    log.verbose('discordListener', '%s (author username) should not be equal to %s (bot username)', message.author.username, config.discord.client.user.username)
    if (message.author.username === config.discord.client.user.username) return

    // make sure this channel is meant for the bot
    if (!config.discord.channels.find('id', message.channel.id)) return log.verbose('discordListener', 'Channel not found in bot\'s channel map')

    // copy message content to a new variable, as the cleanContent property is read-only
    var content = message.cleanContent
    log.verbose('discordListener: clean content', content)

    // parse embed into plaintext
    if (message.embeds.length > 0) {
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
      body: handleCustomEmoji(
        config.messenger.showUsername ? (config.messenger.boldUsername ? `*${username}*: ${content}` : `${username}: ${content}`) : content
      ),
      url: message.attachments.size > 0 ? message.attachments.first().url : imageUrl
    }
    if (config.messenger.separateImages) msg = [ { body: msg.body }, { url: msg.url } ]
    log.silly('discordListener: message', msg)
    var threadID = ([...config.discord.channels].find(([, v]) => v.id === message.channel.id) || [])[0] || message.channel.topic
    log.verbose('discordListener: threadID', threadID)

    // send message to thread with ID specified in topic
    if (!config.messenger.separateImages) {
      config.messenger.client.sendMessage(msg, threadID, sentMessageCallback)
    } else {
      config.messenger.client.sendMessage(msg[0], threadID, sentMessageCallback)
      config.messenger.client.sendMessage(msg[1], threadID, sentMessageCallback)
    }
  } catch (e) {
    sendError(e)
  }
}

function sentMessageCallback (err, info) {
  if (err) log.error('discordListener', err)
  log.silly('discordListener: sent message info', info)
}
