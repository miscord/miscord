const Discord = require('discord.js')

// function creating message from template
module.exports = opts => {
  var {thread, sender, message} = opts
  var attach = message.attachments

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? nickname + ` (${sender.name})` : sender.name
  var embed = new Discord.RichEmbed()
    .setDescription(message.body)
    .setAuthor(authorName, sender.thumbSrc)

  // if there are no attachments, send it already
  if (attach.length === 0) return embed

  // if it's an image, then embed it
  if (attach[0].type === 'photo') return embed.setImage(attach[0].url)

  // if it's not an image, simply attach the file
  return embed.attachFile(attach[0].url)
}
