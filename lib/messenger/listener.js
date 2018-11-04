const log = logger.withScope('messenger:listener')

const createMessage = require('../createMessage').fromMessenger
const { sendMessage } = require('../discord')
const { filter, getChannelName, getSender, getThread } = require('./')

module.exports = async message => {
  if (!message) throw new Error('Message missing!')

  log.trace('message', toStr(message))
  log.info('Got a Messenger message')

  if (message.message.toLowerCase().startsWith('m!keep')) return

  // get thread info to know if it's a group conversation
  const thread = await getThread(message.threadId)
  log.debug('Got Messenger thread')
  log.trace('thread', toStr(thread))

  // also get sender info
  const sender = await getSender(message.authorId)
  log.debug('Got user info')
  log.trace('sender', toStr(sender))

  const cleanname = await getChannelName(thread)

  // handle whitelist
  if (!filter(cleanname, message.threadId)) return

  // get channel
  const channels = await connections.getChannels(message.threadId, cleanname)
  if (!channels || !channels.length) return
  log.debug('Got Discord channels')

  await Promise.all(channels.map(async channel => {
    const { body, opts } = await createMessage.discord(thread, sender, message)
    const files = opts.files ? opts.files.filter(f => f) : []
    if (opts.files && opts.files.length > files.length && config.messenger.attachmentTooLargeError) {
      messenger.client.sendMessage(Number(thread.id), `Your attachment couldn't be sent on Discord due to file size limits.`)
    }
    opts.files = files
    if (!body && !opts.files.length) return log.debug('Not sending message, empty.')
    sendMessage(channel, body, opts, thread.image)
  }))

  // check if it needs resending (linked channels)
  const threads = connections.getThreads(message.threadId).filter(thread => thread.id !== message.threadId.toString()).filter(el => !el.readonly)
  if (threads.length) {
    threads.forEach(async _thread => {
      const { body, attachments } = await createMessage.messenger(thread, sender, message, cleanname)
      log.debug('Created Messenger message')
      if (body && body.trim()) {
        log.debug('Sending Messenger message')
        const info = await messenger.client.sendMessage(Number(_thread.id), body.toString())
        log.trace('sent message info', toStr(info))
        log.debug('Sent message on Messenger')
      }
      if (attachments) {
        log.debug('Sending Messenger attachments')
        const info = await Promise.all(attachments.map(attachment => messenger.client.sendAttachmentStream(_thread.id, attachment.extension, attachment.stream)))
        log.trace('sent attachments info', toStr(info))
        log.debug('Sent Messenger attachments')
      }
    })
  }
}
