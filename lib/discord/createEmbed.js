const Discord = require('discord.js')
const log = require('npmlog')
const getFilename = url => require('url').parse(url, true).pathname.split('/').pop('-1')

// function creating message from template
module.exports = opts => {
  var {thread, sender, message} = opts
  log.silly('createEmbed: thread', thread)
  log.silly('createEmbed: sender', sender)
  log.silly('createEmbed: message', message)

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? `${nickname} (${sender.name})` : sender.name

  log.verbose('createEmbed', 'Nickname: %s, author name: %s', nickname, authorName)

  var embed = new Discord.RichEmbed()
    .setDescription(message.body)
    .setAuthor(authorName, sender.thumbSrc)

  log.silly('createEmbed', embed)

  // if there are no attachments, send it already
  if (!message.attachments.length > 0) return [ embed ]

  log.silly('createEmbed: attachments', message.attachments)

  for (let attach of message.attachments) {
    if ((attach.title || attach.description) && attach.title !== 'Update Messenger to the latest version.' && attach.type !== 'sticker') {
      var { title, description } = attach
      embed.setDescription(embed.description + (title ? '\n' + title : '') + (description ? '\n' + description : ''))
    }
  }

  // if it's a share, then add image as an attachment and set embed's URL to share URL
  if (message.attachments[0].type === 'share') {
    if (message.attachments[0].image) {
      var imageURL = require('url').parse(message.attachments[0].image, true)
      imageURL = imageURL.pathname === '/safe_image.php' ? imageURL.query.url : message.attachments[0].image
      return [{ embed: embed.setURL(message.attachments[0].url), files: [{ name: getFilename(imageURL), attachment: imageURL }] }]
    }
    return [{ embed: embed.setURL(message.attachments[0].url) }]
  }
  return [{ embed, files: message.attachments.map(attach => ({ name: getFilename(attach.url), attachment: attach.url })) }]
}
