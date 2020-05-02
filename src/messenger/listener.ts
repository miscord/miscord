import cleanTemporaryFiles from './cleanTemporaryFiles'
import { Message } from 'libfb'
import { fromMessenger as createMessage } from '../createMessage'
import { sendMessage as sendDiscordMessage } from '../discord'
import { checkIgnoredSequences, checkMKeep } from '../utils'
import { getSender, getThread, sendMessage as sendMessengerMessage } from './'
import { reportError } from '../error'

const log = logger.withScope('messenger:listener')

export default async function handleMessage (message: Message): Promise<void> {
  if (!message) throw new Error('Message missing!')

  if (config.paused) {
    log.info('Got a Messenger message (paused)')
    return
  }

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

  const connection = await connections.getWithCreateFallback(message.threadId.toString(), thread.cleanName)
  if (!connection) return

  await connection.checkChannelRenames(thread.cleanName)

  {
    const channels = await connection.getWritableChannels()
    const data = await createMessage.toDiscord(thread, sender, message)
    for (const channel of channels) {
      sendDiscordMessage(channel.id, data, thread.image)
        .catch(err => reportError(err))
    }
  }
  {
    const threads = connection.getOtherWritableThreads(message.threadId)
    const data = await createMessage.toMessenger(thread, sender, message)
    Promise.all(threads.map(thread => sendMessengerMessage(thread, data)))
      .then(() => cleanTemporaryFiles(data))
      .catch(err => reportError(err))
  }
}
