import getAttachmentURL from '../getAttachmentURL'

const log = logger.withScope('createMessage:fromMessenger:discord')

import { WebhookMessageOptions } from 'discord.js'
import Thread from '../../types/Thread'
import { User, Message, FileAttachment, XMAAttachment } from 'libfb'
import handleEmojis from '../../discord/handleEmojis'
import handleMentions from '../../discord/handleMentions'
import emojiCount from '../emojiCount'
import parseMessengerMessage from './parseMessengerMessage'
import url from 'url'

const thumbs = [ 369239263222822, 369239383222810, 369239343222814 ]

export default async (thread: Thread, sender: User, message: Message) => {
  // set description to message body, set author to message sender
  let authorName
  ({ authorName, message } = parseMessengerMessage(thread, sender, message))

  let body = handleEmojis(handleMentions(message.message))
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

  for (let attach of files) {
    const url = attach.url || await getAttachmentURL(message, attach)

    if (!url) break
    if (attach.size && attach.size > 8 * 1024 * 1024) {
      log.warn('Attachment was not sent due to Discord file size limit', attach)
    }

    opts.files!!.push({ attachment: url, name: attach.filename })
  }

  const appendToBody = (str: string) => { if (!body.includes(str)) body += '\n' + str }
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
