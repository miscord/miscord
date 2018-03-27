const Discord = require('discord.js')
const log = require('npmlog')

// function creating message from template
module.exports = opts => {
  var {thread, sender, message} = opts
  log.silly('createMessage: thread', thread)
  log.silly('createMessage: sender', sender)
  log.silly('createMessage: message', message)
  var attach = message.attachments

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? nickname + ` (${sender.name})` : sender.name

  log.verbose('createMessage', 'Nickname: %s, author name: %s', nickname, authorName)
  log.verbose('createMessage: content', message.body)

  var discordMessage = `**${authorName}**: ${message.body}`

  // if there are no attachments, send it already
  if (attach.length === 0) return [ discordMessage ]

  var embed = new Discord.RichEmbed()

  // if it's an image or a sticker, then embed it
  if (attach[0].type === 'photo' || attach[0].type === 'sticker') return [ discordMessage, embed.setImage(attach[0].url) ]

  // if it's not an image, simply attach the file
  return [ discordMessage, embed.attachFile(attach[0].url) ]
}
