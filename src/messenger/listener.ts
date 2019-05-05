import { Endpoint } from '../Connection'

const log = logger.withScope('messenger:listener')

import fs from 'fs-extra'
import { Message } from 'libfb'
import { fromMessenger as createMessage } from '../createMessage'
import { sendMessage } from '../discord'
import { checkIgnoredSequences, checkMKeep } from '../utils'
import { getSender, getThread } from './'

export default async (message: Message) => {
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
  if (!sender) return
  log.debug('Got user info')
  log.trace('sender', sender)

  let connection = await connections.getWithCreateFallback(message.threadId.toString(), thread.cleanName)
  if (!connection) return

  await connection.checkChannelRenames(thread.cleanName)

  // get channel
  const channels = await connection.getWritableChannels()
  log.debug('Got Discord channels')

  const { body, opts } = await createMessage.toDiscord(thread, sender, message)
  channels.map(async endpoint => {
    if (!body && !(opts.files && opts.files.length)) return log.warn('Not sending message, empty.')
    return sendMessage(endpoint.channel, body, opts, thread.image)
  })

  // check if it needs resending (linked channels)
  const threads = connection.getOtherWritableThreads(message.threadId)
  const { body: mBody, attachments } = await createMessage.toMessenger(thread, sender, message, thread.cleanName)
  log.debug('Created Messenger message')
  Promise.all(threads.map(async (_thread: Endpoint) => {
    if (mBody && mBody.trim()) {
      log.debug('Sending Messenger message')
      const info = await messenger.client.sendMessage(_thread.id, mBody.toString())
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
