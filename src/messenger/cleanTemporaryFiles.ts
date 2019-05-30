const log = logger.withScope('messenger:cleanTemporaryFiles')

import { MessengerMessageData } from '../createMessage/MessageData'
import fs from 'fs-extra'

export default async function cleanTemporaryFiles ({ attachments }: MessengerMessageData) {
  if (attachments && attachments.length) {
    await Promise.all(attachments.map(attachment => fs.unlink(attachment.filePath)))
    log.debug('Removed temporary attachment files')
  }
}
