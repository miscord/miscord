const Discord = require('discord.js')
const log = require('npmlog')

// function creating message from template
module.exports = opts => {
  var {thread, sender, message} = opts
  log.silly('createEmbed: thread', thread)
  log.silly('createEmbed: sender', sender)
  log.silly('createEmbed: message', message)
  var attach = message.attachments

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? nickname + ` (${sender.name})` : sender.name

  log.verbose('createEmbed', 'Nickname: %s, author name: %s', nickname, authorName)

  var embed = new Discord.RichEmbed()
    .setDescription(message.body)
    .setAuthor(authorName, sender.thumbSrc)

  log.silly('createEmbed', embed)

  // if there are no attachments, send it already
  if (attach.length === 0) return embed

  // if it's an image or a sticker, then embed it
  if (attach[0].type === 'photo' || attach[0].type === 'sticker' || attach[0].type === 'animated_image') return embed.setImage(attach[0].url)

  // if it's not an image, simply attach the file
  return embed.attachFile(attach[0].url)
}
