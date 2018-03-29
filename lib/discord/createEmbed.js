const Discord = require('discord.js')
const log = require('npmlog')

// function creating message from template
module.exports = opts => {
  var {thread, sender, message} = opts
  log.silly('createEmbed: thread', thread)
  log.silly('createEmbed: sender', sender)
  log.silly('createEmbed: message', message)
  var attach = message.attachments[0]

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? nickname + ` (${sender.name})` : sender.name

  log.verbose('createEmbed', 'Nickname: %s, author name: %s', nickname, authorName)

  var embed = new Discord.RichEmbed()
    .setDescription(message.body)
    .setAuthor(authorName, sender.thumbSrc)

  log.silly('createEmbed', embed)

  // if there are no attachments, send it already
  if (!attach) return embed

  if ((attach.title || attach.description) && attach.title !== 'Update Messenger to the latest version.') embed.setDescription(embed.description + ('\n' + attach.title) || '' + ('\n' + attach.description) || '')

  // if it's an image or a sticker, then embed it
  if (attach.type === 'photo' || attach.type === 'sticker' || attach.type === 'animated_image') return embed.setImage(attach.url)
  if (attach.type === 'share') {
    if (attach.image) {
      var imageURL = require('url').parse(attach.image, true)
      return imageURL.pathname === '/safe_image.php' ? embed.setImage(imageURL.query.url) : embed.setImage(attach.image)
    }
    return embed.setURL(attach.url)
  }

  // if it's not an image nor share, simply attach the file
  return embed.attachFile(attach.url)
}
