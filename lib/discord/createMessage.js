const Discord = require('discord.js')
const log = require('npmlog')

// function creating message from template
module.exports = opts => {
  var {thread, sender, message} = opts
  log.silly('createMessage: thread', thread)
  log.silly('createMessage: sender', sender)
  log.silly('createMessage: message', message)
  var attach = message.attachments[0]

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? nickname + ` (${sender.name})` : sender.name

  log.verbose('createMessage', 'Nickname: %s, author name: %s', nickname, authorName)
  log.verbose('createMessage: content', message.body)

  var discordMessage = `**${authorName}**: ${message.body}`

  // if there are no attachments, send it already
  if (!attach) return [ discordMessage ]

  if (attach.title || attach.description) discordMessage += ('\n' + attach.title) || '' + ('\n' + attach.description) || ''
  return [ discordMessage, getEmbed(attach) ]
}

function getEmbed (attach) {
  var embed = new Discord.RichEmbed()
  if (attach.type === 'photo' || attach.type === 'sticker') return embed.setImage(attach.url)
  if (attach.type === 'share') {
    if (attach.image) {
      var imageURL = require('url').parse(attach.image, true)
      return imageURL.pathname === '/safe_image.php' ? embed.setImage(imageURL.query.url) : embed.setImage(attach.image)
    }
    return embed.setURL(attach.url)
  }
  return embed.attachFile(attach.url)
}
