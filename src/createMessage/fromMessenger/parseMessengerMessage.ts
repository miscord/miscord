import Thread from '../../types/Thread'
import { User, Message } from 'libfb'

const log = logger.withScope('createMessage:parseMessengerMessage')
export const thumbs = [ 369239263222822, 369239383222810, 369239343222814 ]

export default (thread: Thread, sender: User, message: Message) => {
  const nickname = thread.nicknames ? thread.nicknames.get(message.authorId) : null
  const authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name

  log.debug(`Nickname: ${nickname}, author name: ${authorName}`)
  log.debug('content', message.message)

  if (message.stickerId && thumbs.includes(message.stickerId)) message.message = '👍'

  return { authorName, message }
}
