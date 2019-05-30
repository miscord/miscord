const log = logger.withScope('createMessage:fromMessenger:messenger')

import getAttachmentURL from '../getAttachmentURL'
import { User, Message, FileAttachment, XMAAttachment } from 'libfb'
import Thread from '../../types/Thread'
import downloadFile from '../downloadFile'
import parseMessengerMessage, { thumbs } from './parseMessengerMessage'
import { MessengerMessageData } from '../MessageData'

export default async (thread: Thread, sender: User, message: Message): Promise<MessengerMessageData> => {
  // set description to message body, set author to message sender
  let authorName
  ({ authorName, message } = parseMessengerMessage(thread, sender, message))

  let body = config.messenger.format
    .replace('{username}', authorName)
    .replace('{content}', message.message)
    .replace('{message}', message.message)
    .replace('{source}', config.messenger.sourceFormat.messenger.replace('{name}', thread.name))
    .replace('{newline}', '\n')

  if ((!message.attachments || !message.attachments.length) && !message.stickerId) return { body, attachments: [] }
  const files = message.attachments.filter(attach => attach.type.endsWith('Attachment')) as FileAttachment[]
  const xma = message.attachments.filter(attach => attach.type.endsWith('XMA')) as XMAAttachment[]

  const attachments = []
  for (let attach of files) {
    const url = attach.url ? attach.url : await getAttachmentURL(message, attach)

    if (!url) continue

    attachments.push(await downloadFile(url))
  }

  const appendToBody = (str: string) => { if (!body.includes(str)) body += '\n' + str }
  for (let attach of xma) {
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
