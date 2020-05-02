import getAttachmentURL from '../getAttachmentURL'
import { Message, User } from 'libfb'
import Thread from '../../types/Thread'
import downloadFile from '../downloadFile'
import parseMessengerMessage, { thumbs } from './parseMessengerMessage'
import { MessengerMessageData } from '../MessageData'

const log = logger.withScope('createMessage:fromMessenger:messenger')

export default async function toMessenger (thread: Thread, sender: User, message: Message): Promise<MessengerMessageData> {
  // set description to message body, set author to message sender
  let authorName
  ({ authorName, message } = parseMessengerMessage(thread, sender, message))

  let body = config.messenger.format
    .replace('{username}', authorName)
    .replace('{content}', message.message)
    .replace('{message}', message.message)
    .replace('{source}', config.messenger.sourceFormat.messenger.replace('{name}', thread.name))
    .replace('{newline}', '\n')

  if (
    (!message.fileAttachments || !message.fileAttachments.length) &&
    (!message.mediaAttachments || !message.mediaAttachments.length) &&
    !message.stickerId
  ) return { body, attachments: [] }

  const attachments = []
  for (const attach of message.fileAttachments) {
    const url = attach.url ? attach.url : await getAttachmentURL(message, attach)

    if (!url) continue

    attachments.push(await downloadFile(url))
  }

  const appendToBody = (str: string): void => {
    if (!body.includes(str)) body += '\n' + str
  }

  for (const attach of message.mediaAttachments) {
    if (attach.message) appendToBody(attach.message)
    if (attach.description) appendToBody(attach.description)
    if (attach.url) appendToBody(attach.url)
    if (attach.imageURL) attachments.push(await downloadFile(attach.imageURL))
  }

  if (message.stickerId && !thumbs.includes(message.stickerId)) {
    attachments.push(await messenger.client.getStickerURL(message.stickerId).then(downloadFile))
  }

  log.trace('attachments', attachments)

  return { body, attachments }
}
