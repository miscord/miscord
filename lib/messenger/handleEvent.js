const log = require('npmlog')

const getThread = require('../messenger/getThread.js')
const getSender = require('../messenger/getSender.js')
const getChannel = require('../discord/getChannel.js')
const getCleanName = require('../messenger/getCleanName.js')
const filter = require('../messenger/filter.js')

module.exports = async opts => {
  var { config, message } = opts
  log.silly('handleEvent: event', message)

  // get thread info to know if it's a group conversation
  var thread = await getThread(config, message.threadID)
  log.verbose('handleEvent', 'Got Messenger thread')
  log.silly('messengerListener: thread', thread)

  // also get sender info
  var sender = await getSender(config, message.author)
  log.verbose('messengerListener', 'Got user info')
  log.silly('handleEvent: sender', sender)

  var cleanname = getCleanName(thread, sender, message)

  // handle white/blacklist
  if (!filter(config, cleanname, message)) return

  var channel = await getChannel({ config, name: thread.name, topic: message.threadID })
  channel.sendMessage(`*${message.logMessageBody}*`)
}
