const log = require('npmlog')
const url = require('url')
const handleMentions = require('./handleMentions')

// function creating message from template
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

function resolveImageURL (attach) {
  var baseURL = attach.image || attach.url
  var parse = u => url.parse(u, true)
  if (!baseURL) return
  baseURL = baseURL.match(/^(http|https):\/\/l\.facebook\.com\/l\.php/i) ? parse(baseURL).query.u : baseURL
  var imageURL = parse(baseURL).pathname === '/safe_image.php' ? parse(baseURL).query.url : baseURL
  var name = parse(imageURL).pathname.split('/').pop('-1')
  return {
    name: name.includes('.') ? name : name + '.png',
    attachment: imageURL
  }
}

// https://blog.jonnew.com/posts/poo-dot-length-equals-two
function emojiCount (str) {
  const split = str.split('\u{200D}')
  let count = 0

  for (const s of split) {
    const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join('')).length
    count += num
  }

  return count / split.length
}
