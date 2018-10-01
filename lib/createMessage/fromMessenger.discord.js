const log = logger.withScope('createMessage:fromMessenger:discord')
const handleMentions = require('../discord/handleMentions')
const emojiCount = require('./emojiCount')
const thumbs = [ 369239263222822, 369239383222810, 369239343222814 ]

module.exports = async (thread, sender, message) => {
  // set description to message body, set author to message sender
  const nickname = thread.nicknames ? thread.nicknames[message.authorId.toString()] : null
  const authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name

  log.debug(`Nickname: ${nickname}, author name: ${authorName}`)
  log.debug('content', message.message)

  if (message.stickerId && thumbs.includes(message.stickerId)) message.message = '👍'

  let discordMessage = handleMentions(message.message)
  if (discordMessage.length > 2000) discordMessage = discordMessage.slice(0, 1997) + '...'

  // if there are no attachments, send it already
  const opts = {
    username: authorName.length <= 32 ? emojiCount(authorName) === 1 ? authorName + '.' : authorName : authorName.substr(0, 29) + '...',
    avatarURL: sender.profilePicLarge
  }
  if ((!message.attachments || !message.attachments.length) && !message.stickerId) return [ discordMessage, opts ]

  const files = await Promise.all(
    (message.attachments || []).map(async attach => ({
      name: attach.filename,
      attachment: await messenger.client.getAttachmentURL(message.id, attach.id)
    }))
  )

  log.trace('files', toStr(files))

  if (message.stickerId && !thumbs.includes(message.stickerId)) {
    const stickerURL = await messenger.client.getStickerURL(message.stickerId)
    files.push({ name: message.stickerId + '.png', attachment: stickerURL })
  }

  opts.files = files
  return [ discordMessage, opts ]
}
