const log = require('npmlog')

const removeAccents = require('remove-accents')
const emojiStrip = require('emoji-strip')

module.exports = (thread, sender, message, clean = true) => {
  // get sender's nickname
  var nickname = thread.nicknames[message.senderID || message.author]
  log.verbose('getChannelName: nickname', nickname)

  // get thread name / user
  var name = thread.isGroup ? (thread.name || thread.threadID) : (nickname || sender.name)
  log.verbose('getChannelName: raw channel name', name)

  if (!clean) return name

  // clean name for the needs of discord channel naming
  var cleanname = emojiStrip(removeAccents(name)).trim().replace(/ /g, '-').replace(/\W-/g, '').replace(/(?![a-zA-Z0-9\-_])/g, '').toLowerCase()
  log.verbose('getChannelName: clean channel name', cleanname)

  return cleanname
}
