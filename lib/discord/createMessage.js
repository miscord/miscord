const log = require('npmlog')
const getFilename = url => require('url').parse(url, true).pathname.split('/').pop('-1')

// function creating message from template
module.exports = opts => {
  var {thread, sender, message} = opts
  log.silly('createMessage: thread', thread)
  log.silly('createMessage: sender', sender)
  log.silly('createMessage: message', message)
  var attach = message.attachments[0]

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? `${nickname} (${sender.name})` : sender.name

  log.verbose('createMessage', 'Nickname: %s, author name: %s', nickname, authorName)
  log.verbose('createMessage: content', message.body)

  var discordMessage = `**${authorName}**: ${message.body}`

  // if there are no attachments, send it already
  if (!attach) return [ discordMessage ]

  log.silly('createEmbed: attachment', attach)

  for (let attach of message.attachments) {
    if ((attach.title || attach.description) && attach.title !== 'Update Messenger to the latest version.') {
      var { title, description } = attach
      discordMessage += (title ? '\n' + title : '') + (description ? '\n' + description : '')
    }
  }
  if (attach.type === 'share') {
    if (attach.image) {
      var imageURL = require('url').parse(attach.image, true)
      imageURL = imageURL.pathname === '/safe_image.php' ? imageURL.query.url : attach.image
      return [ discordMessage + '\n' + attach.url, { files: [{ name: getFilename(imageURL), attachment: imageURL }] } ]
    }
    return [ discordMessage + '\n' + attach.url ]
  }
  return [ discordMessage, { files: message.attachments.map(attach => ({ name: getFilename(attach.url), attachment: attach.url })) } ]
}
