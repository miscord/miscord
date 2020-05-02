import { MessengerMessageData } from '../createMessage/MessageData'
import fs from 'fs-extra'

const log = logger.withScope('messenger:cleanTemporaryFiles')

export default async function cleanTemporaryFiles ({ attachments }: MessengerMessageData): Promise<void> {
  if (attachments?.length) {
    await Promise.all(attachments.map(attachment => fs.unlink(attachment.filePath)))
    log.debug('Removed temporary attachment files')
  }
}
