const log = logger.withScope('messenger:getChannelName')

const removeAccents = require('remove-accents')
const emojiStrip = require('emoji-strip')
const getSender = require('./getSender')

module.exports = async (thread, clean = true) => {
  // get thread name / user
  let name
  try {
    name = thread.isGroup ? thread.name || thread.id : thread.nicknames[thread.id] || (await getSender(thread.id)).name
  } catch (err) {
    name = thread.name || thread.id
  }
  log.debug('raw channel name', name)

  if (!clean) return name

  // clean name for the needs of discord channel naming
  var cleanname = emojiStrip(removeAccents(name.toString())).trim().replace(/ /g, '-').replace(/\W-/g, '').replace(/(?![a-zA-Z0-9\-_])/g, '').toLowerCase()
  log.debug('clean channel name', cleanname)

  return cleanname
}
