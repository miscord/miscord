import getThread from './getThread'
import handleMentions from './handleMentions'
import { MessengerMessageData } from '../createMessage/MessageData'
import { Endpoint } from '../Connection'

const log = logger.withScope('messenger:sendMessage')

export default async function sendMessage (thread: Endpoint, { body, attachments }: MessengerMessageData): Promise<void> {
  // handle mentions
  const mentions = handleMentions(body, await getThread(thread.id))

  if (body?.trim()) {
    log.debug('Sending Messenger message')
    const info = await messenger.client.sendMessage(thread.id, body, { mentions })
    log.trace('sent message info', info)
    log.debug('Sent message on Messenger')
  }

  if (attachments?.length) {
    log.debug('Sending Messenger attachments')
    const info = await Promise.all(attachments.map(attachment => messenger.client.sendAttachmentFile(thread.id, attachment.filePath, attachment.extension)))
    log.trace('sent attachments info', info)
    log.debug('Sent Messenger attachments')
  }
}
