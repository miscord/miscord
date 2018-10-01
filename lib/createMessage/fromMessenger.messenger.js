const downloadFile = require('./downloadFile')
const thumbs = [ 369239263222822, 369239383222810, 369239343222814 ]

module.exports = async (thread, sender, message, source) => {
  // set description to message body, set author to message sender
  const nickname = thread.nicknames ? thread.nicknames[message.authorId.toString()] : null
  const authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name

  if (message.stickerId && thumbs.includes(message.stickerId)) message.message = '👍'

  let body = config.messenger.format
    .replace('{username}', authorName)
    .replace('{content}', message.message)
    .replace('{message}', message.message)
    .replace('{source}', config.messenger.sourceFormat.messenger.replace('{name}', source))
    .replace('{newline}', '\n')

  if ((!message.attachments || !message.attachments.length) && !message.stickerId) return { body }

  const attachments = await Promise.all(
    (message.attachments || []).map(attach => messenger.client.getAttachmentURL(message.id, attach.id).then(downloadFile))
  )

  if (message.stickerId && !thumbs.includes(message.stickerId)) {
    attachments.push(await messenger.client.getStickerURL(message.stickerId).then(downloadFile))
  }

  return { body, attachments }
}
