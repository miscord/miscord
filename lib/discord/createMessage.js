const log = require('npmlog')
const url = require('url')

// function creating message from template
module.exports = (thread, sender, message, showFullNames) => {
  var attach = message.attachments[0]

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? (showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name

  log.verbose('createMessage', 'Nickname: %s, author name: %s', nickname, authorName)
  log.verbose('createMessage: content', message.body)

  var discordMessage = message.body

  // if there are no attachments, send it already
  var opts = { username: authorName, avatarURL: `https://graph.facebook.com/${message.senderID}/picture?width=128` }
  if (!attach) return [ discordMessage, opts ]

  log.silly('createMessage: attachment', attach)

  for (let attach of message.attachments) {
    if ((attach.title || attach.description) && attach.title !== 'Update Messenger to the latest version.' && attach.type !== 'sticker') {
      var { title, description } = attach
      discordMessage += (title ? '\n' + title : '') + (description ? '\n' + description : '')
    }
  }
  if (attach.type === 'share') {
    if (attach.image) {
      opts.files = [ resolveImageURL(attach) ]
      return [ discordMessage + '\n' + attach.url, opts ]
    }
    return [ discordMessage + '\n' + attach.url ]
  }
  opts.files = message.attachments.map(resolveImageURL)
  return [ discordMessage, opts ]
}

function resolveImageURL (attach) {
  var baseURL = attach.image || attach.url
  var imageURL = url.parse(baseURL, true)
  return {
    name: url.parse(imageURL, true).pathname.split('/').pop('-1'),
    attachment: imageURL.pathname === '/safe_image.php' ? imageURL.query.url : baseURL
  }
}
