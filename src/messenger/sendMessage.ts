const log = logger.withScope('messenger:sendMessage')

import { MessengerMessageData } from '../createMessage/MessageData'
import { Endpoint } from '../Connection'

export default async function sendMessage (thread: Endpoint, { body, attachments }: MessengerMessageData) {
  if (body && body.trim()) {
    log.debug('Sending Messenger message')
    const info = await messenger.client.sendMessage(thread.id, body.toString())
    log.trace('sent message info', info)
    log.debug('Sent message on Messenger')
  }
  if (attachments && attachments.length) {
    log.debug('Sending Messenger attachments')
    const info = await Promise.all(attachments.map(attachment => messenger.client.sendAttachmentFile(thread.id, attachment.filePath, attachment.extension)))
    log.trace('sent attachments info', info)
    log.debug('Sent Messenger attachments')
  }
}
