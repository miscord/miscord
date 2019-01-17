const log = logger.withScope('createMessage:fromMessenger:discord')
const handleMentions = require('../discord/handleMentions')
const handleEmojis = require('../discord/handleEmojis')
const emojiCount = require('./emojiCount')
const getAttachmentURL = require('./getAttachmentURL')
const thumbs = [ 369239263222822, 369239383222810, 369239343222814 ]
const parseMessengerMessage = require('./parseMessengerMessage')

module.exports = async (thread, sender, message) => {
  // set description to message body, set author to message sender
  let authorName
  ({ authorName, message } = parseMessengerMessage(thread, sender, message))

  let body = handleEmojis(handleMentions(message.message))
  if (body.length > 2000) body = body.slice(0, 1997) + '...'

  // if there are no attachments, send it already
  const opts = {
    username: authorName.length <= 32 ? emojiCount(authorName) === 1 ? authorName + '.' : authorName : authorName.substr(0, 29) + '...',
    avatarURL: sender.profilePicLarge
  }
  if ((!message.attachments || !message.attachments.length) && !message.stickerId) return { body, opts }

  log.trace('attachments to parse', message.attachments)
  const files = await Promise.all(
    (message.attachments || []).map(async attach => {
      const url = await getAttachmentURL(message, attach)
      log.trace('attachment URL', url)
      if (!url) return
      if (url.textContent) {
        log.debug('URL has text content, moving to the message body', url.textContent)
        if (!body.includes(url.textContent)) body += '\n' + url.textContent
        return
      }
      return {
        name: attach.filename || require('url').parse(url).pathname.split('/').slice(-1)[0],
        attachment: url,
        size: attach.fileSize || 1
      }
    })
  )

  if (message.stickerId && !thumbs.includes(message.stickerId)) {
    const stickerURL = await messenger.client.getStickerURL(message.stickerId)
    files.push({ name: message.stickerId + '.png', attachment: stickerURL, size: 1 })
  }
  opts.files = files
    .filter(a => a)
    .filter(a => a.attachment && a.name && a.size)
    .map((value, index) => value.size < 8e6 ? value : null)

  log.trace('files', opts.files)

  return { body, opts }
}
