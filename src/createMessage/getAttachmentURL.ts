const log = logger.withScope('createMessage:getAttachmentURL')

import { Message, FileAttachment } from 'libfb'

export default async (message: Message, attach: FileAttachment) => {
  let url
  try {
    url = await messenger.client.getAttachmentURL(message.id, attach.id)
  } catch (err) {
    log.warn(err)
    log.warn('Failed to get the URL, retrying in 5 seconds...')
    await new Promise(resolve => setTimeout(resolve, 5 * 1000))
    try {
      url = await messenger.client.getAttachmentURL(message.id, attach.id)
    } catch (err) {
      log.fatal(`Could not get an URL for attachment ${attach.id}`)
      return
    }
  }
  if (!url) log.fatal(`Could not get an URL for attachment ${attach.id}`)
  return url
}
