const log = require('npmlog')

const { getThread, getChannelName, filter } = require('./index')

module.exports = async message => {
  log.silly('handleEvent: event', message)

  // get thread info to know if it's a group conversation (disable cache if event is group rename)
  var thread = await getThread(message.threadID, message.logMessageType !== 'log:thread-name')
  log.verbose('handleEvent', 'Got Messenger thread')
  log.silly('handleEvent: thread', thread)

  var cleanname = await getChannelName(thread)

  // handle whitelist
  if (!filter(cleanname, message.threadID)) return

  const channels = await connections.getChannels(message.threadID, thread.name)
  if (channels.length) {
    channels.forEach(async channel => {
      channel.send(`*${connections.getThreads(channel.id).length > 1 ? (await getChannelName(thread, false)) + ': ' : ''}${message.logMessageBody}*`)
    })
  }
}
