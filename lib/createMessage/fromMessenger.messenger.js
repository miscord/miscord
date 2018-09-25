const resolveImageURL = require('./resolveImageURL')
const getStreamFromURL = require('./getStreamFromURL')

module.exports = async (thread, sender, message, source) => {
  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name

  let body = config.messenger.format
    .replace('{username}', authorName)
    .replace('{content}', message.body)
    .replace('{message}', message.body)
    .replace('{source}', config.messenger.sourceFormat.messenger.replace('{name}', source))
    .replace('{newline}', '\n')

  const attachment = await Promise.all(message.attachments.filter(attach => {
    if (attach.caption && attach.caption === 'Like, thumbs up') {
      body += '👍'
      return false
    }
    return true
  }).map(resolveImageURL).filter(a => a).map(attach => attach.attachment).map(getStreamFromURL))

  return { body, attachment }
}
