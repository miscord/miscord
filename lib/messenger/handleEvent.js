const log = require('npmlog')

const { getThread, getSender, getChannelName, filter } = require('./index')

module.exports = async message => {
  log.silly('handleEvent: event', message)

  // get thread info to know if it's a group conversation (disable cache if event is group rename)
  var thread = await getThread(message.threadID, message.logMessageType !== 'log:thread-name')
  log.verbose('handleEvent', 'Got Messenger thread')
  log.silly('messengerListener: thread', thread)

  // also get sender info
  var sender = await getSender(message.author)
  log.verbose('messengerListener', 'Got user info')
  log.silly('handleEvent: sender', sender)

  var cleanname = getChannelName(thread, sender, message)

  // handle white/blacklist
  if (!filter(cleanname, message.threadID)) return

  var channel = await channels.getChannel(message.threadID, thread.name)
  if (channel) channel.send(`*${channels.getThreadIDs(channel.id).length > 1 ? getChannelName(thread, sender, message, false) + ': ' : ''}${message.logMessageBody}*`)
}
