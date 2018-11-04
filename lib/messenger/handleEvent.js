const log = logger.withScope('messenger:handleEvent')

const { getThread, getChannelName, filter } = require('./index')
const handlePlan = require('./handlePlan')

module.exports = async _event => {
  if (!config.discord.showEvents) return

  log.trace('event', toStr(_event))
  const { event, type } = _event
  if (type === 'readReceiptEvent' || type === 'deliveryReceiptEvent') return

  if (type.startsWith('event')) return handlePlan(_event)

  const thread = await getThread(event.threadId, _event.type !== '')
  log.debug('Got Messenger thread')
  log.trace('thread', toStr(thread))

  // handle whitelist
  if (!filter(await getChannelName(thread), event.threadId)) return

  const channels = await connections.getChannels(event.threadId, thread.name)
  if (channels.length) {
    channels.forEach(async channel => {
      channel.send(`*${connections.getThreads(channel.id).length > 1 ? (await getChannelName(thread, false)) + ': ' : ''}${event.message}*`)
    })
  }
  const threads = connections.getThreads(event.threadId).filter(thread => thread.id !== event.threadId.toString()).filter(el => !el.readonly)
  if (threads.length) {
    threads.forEach(async _thread => {
      log.debug('Sending Messenger message')
      const info = await messenger.client.sendMessage(Number(_thread.id), `_${await getChannelName(thread, false)}: ${event.message}_`)
      log.trace('sent message info', toStr(info))
      log.debug('Sent message on Messenger')
    })
  }
}
