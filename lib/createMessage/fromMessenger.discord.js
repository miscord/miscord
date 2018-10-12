const log = logger.withScope('createMessage:fromMessenger:discord')
const handleMentions = require('../discord/handleMentions')
const emojiCount = require('./emojiCount')
const getAttachmentURL = require('./getAttachmentURL')
const thumbs = [ 369239263222822, 369239383222810, 369239343222814 ]

module.exports = async (thread, sender, message) => {
  // set description to message body, set author to message sender
  const nickname = thread.nicknames ? thread.nicknames[message.authorId.toString()] : null
  const authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name

  log.debug(`Nickname: ${nickname}, author name: ${authorName}`)
  log.debug('content', message.message)

  if (message.stickerId && thumbs.includes(message.stickerId)) message.message = '👍'

  let body = handleMentions(message.message)
  if (body.length > 2000) body = body.slice(0, 1997) + '...'

  // if there are no attachments, send it already
  const opts = {
    username: authorName.length <= 32 ? emojiCount(authorName) === 1 ? authorName + '.' : authorName : authorName.substr(0, 29) + '...',
    avatarURL: sender.profilePicLarge
  }
  if ((!message.attachments || !message.attachments.length) && !message.stickerId) return { body, opts }

  const files = await Promise.all(
    (message.attachments || []).map(async attach => ({
      name: attach.filename,
      attachment: await getAttachmentURL(message, attach),
      size: attach.fileSize || 1
    }))
  )

  if (message.stickerId && !thumbs.includes(message.stickerId)) {
    const stickerURL = await messenger.client.getStickerURL(message.stickerId)
    files.push({ name: message.stickerId + '.png', attachment: stickerURL, size: 1 })
  }
  opts.files = files
    .filter(a => {
      if (!a.name) {
        log.debug('Attachment has no name, moving to the message body', a.attachment)
        if (!body.includes(a.attachment)) body += '\n' + a.attachment
        return false
      }
      return true
    })
    .filter(a => a.attachment && a.name && a.size)
    .map((value, index) => value.size < 8e6 ? value : null)

  log.trace('files', toStr(opts.files))

  return { body, opts }
}
