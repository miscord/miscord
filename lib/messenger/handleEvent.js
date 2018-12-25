const log = logger.withScope('messenger:handleEvent')

const { getThread } = require('./index')
const handlePlan = require('./handlePlan')
const handlePoll = require('./handlePoll')

module.exports = async _event => {
  log.trace('event', _event)
  const { event, type } = _event
  if (type === 'readReceiptEvent' || type === 'deliveryReceiptEvent') return

  if (type.startsWith('event')) return handlePlan(_event)
  if (type.startsWith('poll')) return handlePoll(_event)

  if (!config.messenger.handleEvents) return

  const thread = await getThread(event.threadId, type !== 'threadNameEvent')
  log.debug('Got Messenger thread')
  log.trace('thread', thread, 1)

  let connection = await connections.getWithCreateFallback(event.threadId, thread.cleanName)
  if (!connection) return

  if (type === 'threadNameEvent') await connection.checkChannelRenames(thread.name)

  const channels = connection.getWritableChannels()
  channels.forEach(async ({ channel }) => {
    channel.send(`*${connection.getThreads().length > 1 ? thread.name + ': ' : ''}${event.message}*`)
  })

  const threads = connection.getOtherWritableThreads(event.threadId)
  threads.forEach(async _thread => {
    log.debug('Sending Messenger message')
    const info = await messenger.client.sendMessage(Number(_thread.id), `_${thread.name}: ${event.message}_`)
    log.trace('sent message info', info)
    log.debug('Sent message on Messenger')
  })
}
