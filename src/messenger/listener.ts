import cleanTemporaryFiles from './cleanTemporaryFiles'

const log = logger.withScope('messenger:listener')

import { Message } from 'libfb'
import { fromMessenger as createMessage } from '../createMessage'
import { sendMessage as sendDiscordMessage } from '../discord'
import { checkIgnoredSequences, checkMKeep } from '../utils'
import { getSender, getThread, sendMessage as sendMessengerMessage } from './'

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

  {
    const channels = await connection.getWritableChannels()
    const data = await createMessage.toDiscord(thread, sender, message)
    channels.forEach(endpoint => sendDiscordMessage(endpoint.id, data, thread.image))
  }
  {
    const threads = connection.getOtherWritableThreads(message.threadId)
    const data = await createMessage.toMessenger(thread, sender, message)
    Promise.all(threads.map(thread => sendMessengerMessage(thread, data)))
      .then(() => cleanTemporaryFiles(data))
  }
}
