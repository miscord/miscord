const log = logger.withScope('createMessage:fromMessenger:discord')

import getAttachmentURL from '../getAttachmentURL'
import { WebhookMessageOptions } from 'discord.js'
import Thread from '../../types/Thread'
import { User, Message, FileAttachment, XMAAttachment } from 'libfb'
import handleEmojis from '../../discord/handleEmojis'
import emojiCount from '../emojiCount'
import parseMessengerMessage, { thumbs } from './parseMessengerMessage'
import url from 'url'
import { DiscordMessageData } from '../MessageData'

export default async (thread: Thread, sender: User, message: Message): Promise<DiscordMessageData> => {
  // set description to message body, set author to message sender
  let authorName
  ({ authorName, message } = parseMessengerMessage(thread, sender, message))

  let body = handleEmojis(message.message)
  if (body.length > 2000) body = body.slice(0, 1997) + '...'

  // if there are no attachments, send it already
  const opts: WebhookMessageOptions = {
    username: authorName.length <= 32 ? emojiCount(authorName) === 1 ? authorName + '.' : authorName : authorName.substr(0, 29) + '...',
    avatarURL: sender.profilePicLarge,
    files: []
  }
  if ((!message.attachments || !message.attachments.length) && !message.stickerId) return { body, opts }

  const files = message.attachments.filter(attach => attach.type.endsWith('Attachment')) as FileAttachment[]
  const xma = message.attachments.filter(attach => attach.type.endsWith('XMA')) as XMAAttachment[]

  log.trace('attachments to parse', message.attachments)

  const appendToBody = (str: string) => { if (!body.includes(str)) body += '\n' + str }

  let notSentAttachments = false

  for (let attach of files) {
    const url = attach.url || await getAttachmentURL(message, attach)

    if (!url) continue
    if (attach.size && attach.size > 8 * 1024 * 1024) {
      log.warn('Attachment was not sent due to Discord file size limit', attach)
      notSentAttachments = true
    }

    opts.files!!.push({ attachment: url, name: attach.filename })
  }

  if (notSentAttachments) {
    const message = 'Some attachments were not sent due to Discord file size limit'
    appendToBody(message)
    if (config.messenger.attachmentTooLargeError) await messenger.client.sendMessage(thread.id, message)
  }

  for (let attach of xma) {
    if (attach.message) appendToBody(attach.message)
    if (attach.description) appendToBody(attach.description)
    if (attach.url) appendToBody(attach.url)
    if (attach.imageURL) {
      opts.files!!.push({
        attachment: attach.imageURL,
        name: url.parse(attach.imageURL).pathname!!.split('/').slice(-1)[0]
      })
    }
  }

  if (message.stickerId && !thumbs.includes(message.stickerId)) {
    const stickerURL = await messenger.client.getStickerURL(message.stickerId)
    opts.files!!.push({ attachment: stickerURL, name: message.stickerId + '.png' })
  }

  log.trace('files', opts.files)

  return { body, opts }
}
