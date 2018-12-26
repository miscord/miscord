const log = logger.withScope('messenger:handlePoll')

const { getThread } = require('./index')

module.exports = async _poll => {
  log.trace('poll', _poll)
  const { event: poll } = _poll

  if (!config.messenger.handlePolls) return

  const thread = await getThread(poll.threadId)
  log.debug('Got Messenger thread')
  log.trace('thread', thread, 1)

  let connection = await connections.getWithCreateFallback(poll.threadId, thread.cleanName)
  if (!connection) return

  const channels = await connection.getWritableChannels()
  channels.forEach(async ({ channel }) => {
    channel.send({ embed: { title: `Poll: **${poll.title}**`, description: poll.message } })
  })

  const threads = connection.getOtherWritableThreads(poll.threadId)
  threads.forEach(async thread => {
    log.debug('Sending Messenger message')
    const info = await messenger.client.sendMessage(Number(thread.id), `_${thread.name} - ${poll.title}_:\n${poll.message}`)
    log.trace('sent message info', info)
    log.debug('Sent message on Messenger')
  })
}
