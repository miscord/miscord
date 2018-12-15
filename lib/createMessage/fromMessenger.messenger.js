const downloadFile = require('./downloadFile')
const thumbs = [ 369239263222822, 369239383222810, 369239343222814 ]
const log = logger.withScope('createMessage:fromMessenger:messenger')
const getAttachmentURL = require('./getAttachmentURL')
const parseMessengerMessage = require('./parseMessengerMessage')

module.exports = async (thread, sender, message, source) => {
  // set description to message body, set author to message sender
  let authorName
  ({ authorName, message } = parseMessengerMessage(thread, sender, message))

  let body = config.messenger.format
    .replace('{username}', authorName)
    .replace('{content}', message.message)
    .replace('{message}', message.message)
    .replace('{source}', config.messenger.sourceFormat.messenger.replace('{name}', source))
    .replace('{newline}', '\n')

  if ((!message.attachments || !message.attachments.length) && !message.stickerId) return { body }

  const attachments = (await Promise.all(
    (message.attachments || []).filter(attach => attach.mimeType !== 'audio/mpeg').map(async attach => {
      const url = await getAttachmentURL(message, attach)
      if (!url) return
      const { stream } = await downloadFile(url)
      return { stream, extension: attach.mimeType || require('path').parse(stream.path).ext }
    })
  )).filter(a => a)

  if (message.stickerId && !thumbs.includes(message.stickerId)) {
    attachments.push(await messenger.client.getStickerURL(message.stickerId).then(downloadFile))
  }

  log.trace('attachments', attachments)

  return { body, attachments }
}
