const log = logger.withScope('messenger:handlePoll')

const { getThread, getChannelName } = require('./index')

module.exports = async _poll => {
  log.trace('poll', _poll)
  const { poll } = _poll

  const thread = await getThread(poll.threadId)
  log.debug('Got Messenger thread')
  log.trace('thread', thread, 1)

  const channels = await connections.getChannels(poll.threadId, thread.name)
  if (channels.length) {
    channels.forEach(async channel => {
      channel.send({ embed: { title: `Poll: **${poll.title}**`, description: poll.message } })
    })
  }
  const threads = connections.getThreads(poll.threadId).filter(thread => thread.id !== poll.threadId.toString()).filter(el => !el.readonly)
  if (threads.length) {
    threads.forEach(async thread => {
      log.debug('Sending Messenger message')
      const info = await messenger.client.sendMessage(Number(thread.id), `_${await getChannelName(thread, false)} - ${poll.title}_:\n${poll.message}`)
      log.trace('sent message info', info)
      log.debug('Sent message on Messenger')
    })
  }
}
