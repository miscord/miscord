const log = logger.withScope('messenger:handlePlan')

const { getThread, getSender, getChannelName, filter } = require('./index')

module.exports = async _event => {
  log.trace('plan', toStr(_event))
  const { event, type } = _event

  const thread = await getThread(event.threadId)
  log.debug('Got Messenger thread')
  log.trace('thread', toStr(thread))

  // handle whitelist
  if (!filter(await getChannelName(thread), event.threadId)) return

  const people = event.guests
  const going = (await Promise.all(people.filter(el => el.state === 'GOING').map(el => getSender(el.id)))).map(el => el.name)
  const declined = (await Promise.all(people.filter(el => el.state === 'DECLINED').map(el => getSender(el.id)))).map(el => el.name)

  const description = type === 'eventRsvpEvent' || type === 'eventCreateEvent'
    ? `*${event.message}*

Time: ${event.time.toLocaleString('en-GB', {
    timeZone: config.timezone,
    weekday: 'long',
    minute: '2-digit',
    hour: '2-digit',
    day: '2-digit',
    month: 'long'
  })}
Location: ${event.location || '(none)'}

Going (${going.length}): ${going.length > 10 ? going.slice(0, 10).join(', ') + ` and ${going.length - 10} more...` : going.join(', ')}
Can't go (${declined.length}): ${declined.length > 10 ? declined.slice(0, 10).join(', ') + ` and ${declined.length - 10} more...` : declined.join(', ')}
` : event.message

  const channels = await connections.getChannels(event.threadId, thread.name)
  if (channels.length) {
    channels.forEach(async channel => {
      channel.send({ embed: { title: `Event: **${event.title}**`, description } })
    })
  }
  const threads = connections.getThreads(event.threadId).filter(thread => thread.id !== event.threadId.toString()).filter(el => !el.readonly)
  if (threads.length) {
    threads.forEach(async thread => {
      log.debug('Sending Messenger message')
      const info = await messenger.client.sendMessage(Number(thread.id), `_${await getChannelName(thread, false)} - ${event.title}_:\n${description}`)
      log.trace('sent message info', toStr(info))
      log.debug('Sent message on Messenger')
    })
  }
}
