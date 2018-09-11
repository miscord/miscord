const log = require('npmlog')
const handleMentions = require('../discord/handleMentions')
const resolveImageURL = require('./resolveImageURL')
const emojiCount = require('./emojiCount')
const url = require('url')

module.exports = (thread, sender, message) => {
  var attach = message.attachments[0]

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name

  log.verbose('createMessage', 'Nickname: %s, author name: %s', nickname, authorName)
  log.verbose('createMessage: content', message.body)

  var discordMessage = handleMentions(message.body)
  if (discordMessage.length > 2000) discordMessage = discordMessage.slice(0, 1997) + '...'

  // if there are no attachments, send it already
  var opts = {
    username: authorName.length <= 32 ? emojiCount(authorName) === 1 ? authorName + '.' : authorName : authorName.substr(0, 29) + '...',
    avatarURL: `https://graph.facebook.com/${message.senderID}/picture?width=128`
  }
  if (!attach) return [ discordMessage, opts ]

  log.silly('createMessage: attachment', attach)

  for (let attach of message.attachments) {
    if (!attach.url && (attach.title || attach.description) && attach.title !== 'Update Messenger to the latest version.' && attach.type !== 'sticker') {
      var { title, description } = attach
      discordMessage += (title ? '\n' + title : '') + (description ? '\n' + description : '')
    }
  }

  if (attach.type === 'share' && attach.url) {
    if (attach.url.match(/^(http|https):\/\/l\.facebook\.com\/l\.php/i)) {
      attach.url = url.parse(attach.url, true).query.u
    }
    if (!discordMessage.includes(attach.url)) discordMessage += '\n' + attach.url
  }

  opts.files = message.attachments.filter(attach => {
    if (attach.caption && attach.caption === 'Like, thumbs up') {
      discordMessage += '👍'
      return false
    }
    return true
  }).map(resolveImageURL).filter(a => a)
  return [ discordMessage, opts ]
}
