const log = require('npmlog')

const { getThread, getSender, getChannelName, filter } = require('./index')
const { getChannel } = require('../discord')

module.exports = async opts => {
  var { config, message } = opts
  log.silly('handleEvent: event', message)

  // get thread info to know if it's a group conversation (disable cache if event is group rename)
  var thread = await getThread(config, message.threadID, message.logMessageType !== 'log:thread-name')
  log.verbose('handleEvent', 'Got Messenger thread')
  log.silly('messengerListener: thread', thread)

  // also get sender info
  var sender = await getSender(config, message.author)
  log.verbose('messengerListener', 'Got user info')
  log.silly('handleEvent: sender', sender)

  var cleanname = getChannelName(thread, sender, message)

  // handle white/blacklist
  if (!filter(config, cleanname, message)) return

  var isLinked = Boolean(Object.entries(config.messenger.link).find(entry => entry.includes(message.threadID)))

  var channel = await getChannel({
    config,
    name: thread.name,
    topic: message.threadID,
    isLinked
  })
  channel.send(`*${isLinked ? getChannelName(thread, sender, message, false) + ': ' : ''}${message.logMessageBody}*`)
}
