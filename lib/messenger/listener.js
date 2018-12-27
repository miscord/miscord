const log = logger.withScope('messenger:listener')

const createMessage = require('../createMessage').fromMessenger
const { sendMessage } = require('../discord')
const { checkMKeep, checkIgnoredSequences } = require('../utils')
const { getSender, getThread } = require('./')
const fs = require('fs-extra')

module.exports = async message => {
  if (!message) throw new Error('Message missing!')

  log.trace('message', message)
  log.info('Got a Messenger message')

  if (checkMKeep(message.message)) return log.debug('m!keep received, ignoring.')
  if (checkIgnoredSequences(message.message)) return log.debug('found an ignored sequence, ignoring.')

  // get thread info to know if it's a group conversation
  const thread = await getThread(message.threadId)
  log.debug('Got Messenger thread')
  log.trace('thread', thread, 1)

  // also get sender info
  const sender = await getSender(message.authorId)
  log.debug('Got user info')
  log.trace('sender', sender)

  let connection = await connections.getWithCreateFallback(message.threadId, thread.cleanName)
  if (!connection) return

  await connection.checkChannelRenames(thread.name)

  // get channel
  const channels = await connection.getWritableChannels()
  log.debug('Got Discord channels')

  await Promise.all(channels.map(async channel => {
    const { body, opts } = await createMessage.discord(thread, sender, message)
    const files = opts.files ? opts.files.filter(f => f) : []
    if (opts.files && opts.files.length > files.length) {
      log.warn('Some attachments were not sent due to Discord size limits.')
      if (config.messenger.attachmentTooLargeError) {
        messenger.client.sendMessage(Number(thread.id), `Your attachment couldn't be sent on Discord due to file size limits.`)
      }
    }
    opts.files = files
    if (!body && !opts.files.length) return log.debug('Not sending message, empty.')
    sendMessage(channel, body, opts, thread.image)
  }))

  // check if it needs resending (linked channels)
  const threads = connection.getOtherWritableThreads(message.threadId)
  const { body, attachments } = await createMessage.messenger(thread, sender, message, thread.cleanName)
  log.debug('Created Messenger message')
  Promise.all(threads.map(async _thread => {
    if (body && body.trim()) {
      log.debug('Sending Messenger message')
      const info = await messenger.client.sendMessage(Number(_thread.id), body.toString())
      log.trace('sent message info', info)
      log.debug('Sent message on Messenger')
    }
    if (attachments && attachments.length) {
      log.debug('Sending Messenger attachments')
      const info = await Promise.all(attachments.map(attachment => messenger.client.sendAttachmentFile(_thread.id, attachment.filePath, attachment.extension)))
      log.trace('sent attachments info', info)
      log.debug('Sent Messenger attachments')
    }
  })).then(async () => {
    if (attachments && attachments.length) {
      await Promise.all(attachments.map(attachment => fs.unlink(attachment.filePath)))
      log.debug('Removed temporary attachment files')
    }
  })
}
