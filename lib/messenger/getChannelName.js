const log = require('npmlog')

const removeAccents = require('remove-accents')
const emojiStrip = require('emoji-strip')
const getSender = require('./getSender')

module.exports = async (thread, clean = true) => {
  // get thread name / user
  const name = thread.isGroup ? thread.name || thread.threadID : thread.nicknames[thread.threadID] || (await getSender(thread.threadID)).name
  log.verbose('getChannelName: raw channel name', name)

  if (!clean) return name

  // clean name for the needs of discord channel naming
  var cleanname = emojiStrip(removeAccents(name)).trim().replace(/ /g, '-').replace(/\W-/g, '').replace(/(?![a-zA-Z0-9\-_])/g, '').toLowerCase()
  log.verbose('getChannelName: clean channel name', cleanname)

  return cleanname
}
