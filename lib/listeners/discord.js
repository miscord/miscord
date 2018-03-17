const log = require('npmlog')

module.exports = opts => {
  var { message, config } = opts
  log.level = config.logLevel

  log.verbose('discordListener', 'got a discord message')
  log.silly('discordListener', 'Message:', message)
  // don't want to echo bot's messages
  log.verbose('discordListener', '%s (author username) should not be equal to %s (bot username)', message.author.username, config.discord.client.user.username)
  if (message.author.username === config.discord.client.user.username) return

  // make sure this channel is meant for the bot
  log.verbose('discordListener', '%s (numeric channel topic) should be equal to %s (channel topic)', parseInt(message.channel.topic, 10).toString(), message.channel.topic)
  if (parseInt(message.channel.topic, 10).toString() !== message.channel.topic) return

  // make sure it's bot's category
  if (message.channel.parent && message.channel.parent.name !== config.discord.category.name) return

  // copy message content to a new variable, as the cleanContent property is read-only
  var content = message.cleanContent
  log.verbose('discordListener', 'Clean content:', content)

  // parse embed into plaintext
  if (message.embeds.length > 0) {
    message.embeds.forEach(embed => {
      if (embed.title) content += '\n' + embed.title
      if (embed.url) content += '\n(' + embed.url + ')'
      if (embed.description) content += '\n' + embed.description
      embed.fields.forEach(field => { content += '\n\n' + field.name + '\n' + field.value })
    })
    log.verbose('discordListener', 'Message content after parsing embed:', content)
  }

  // build message with attachments provided
  var username = message.member ? (message.member.nickname || message.author.username) : message.author.username
  log.verbose('discordListener', 'Username:', username)
  var msg = {
    body: config.facebook.showUsername ? (config.facebook.boldUsername ? `*${username}*: ${content}` : `${username}: ${content}`) : content,
    url: message.attachments.size > 0 ? message.attachments.first().url : (message.embeds.length > 0 ? message.embeds[0].image : undefined)
  }
  log.silly('discordListener', 'Message:', msg)
  log.verbose('discordListener', 'Channel topic:', message.channel.topic)

  // send message to thread with ID specified in topic
  config.facebook.client.sendMessage(msg, message.channel.topic)
}
