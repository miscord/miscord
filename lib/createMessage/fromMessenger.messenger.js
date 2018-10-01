const downloadFile = require('./downloadFile')
const thumbs = [ 369239263222822, 369239383222810, 369239343222814 ]

module.exports = async (thread, sender, message, source) => {
  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name

  if (message.stickerId && thumbs.includes(message.stickerId)) message.message = '👍'

  let body = config.messenger.format
    .replace('{username}', authorName)
    .replace('{content}', message.message)
    .replace('{message}', message.message)
    .replace('{source}', config.messenger.sourceFormat.messenger.replace('{name}', source))
    .replace('{newline}', '\n')

  const attachments = message.attachments && message.attachments.length ?
    await Promise.all(
      message.attachments.map(attach => messenger.client.getAttachmentURL(message.id, attach.id).then(downloadFile))
    ) : null

  return { body, attachments }
}
