const log = logger.withScope('createMessage:parseMessengerMessage')
const thumbs = [ 369239263222822, 369239383222810, 369239343222814 ]

module.exports = (thread, sender, message) => {
  const nickname = thread.nicknames ? thread.nicknames[message.authorId.toString()] : null
  const authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name

  log.debug(`Nickname: ${nickname}, author name: ${authorName}`)
  log.debug('content', message.message)

  if (message.stickerId && thumbs.includes(message.stickerId)) message.message = '👍'

  if (message.message === '' && message.attachments && message.attachments.some(attach => attach.xmaGraphQL)) {
    let attach = message.attachments.find(attach => attach.xmaGraphQL)
    attach = JSON.parse(attach.xmaGraphQL)
    attach = attach[Object.keys(attach)[0]]
    const story = attach.story_attachment
    if (story.description && story.description.text) message.message = story.description.text
    if (story.title) message.message = story.title
  }

  return { authorName, message }
}
