const log = logger.withScope('messenger:handlePlan')

const { getThread, getSender } = require('./index')

module.exports = async _event => {
  log.trace('plan', _event)
  const { event: plan, type } = _event

  if (!config.messenger.handlePlans) return

  const thread = await getThread(plan.threadId)
  log.debug('Got Messenger thread')
  log.trace('thread', thread, 1)

  let connection = await connections.getWithCreateFallback(plan.threadId, thread.cleanName)
  if (!connection) return

  const people = plan.guests
  const going = (await Promise.all(people.filter(el => el.state === 'GOING').map(el => getSender(el.id)))).map(el => el.name)
  const declined = (await Promise.all(people.filter(el => el.state === 'DECLINED').map(el => getSender(el.id)))).map(el => el.name)

  const description = type === 'eventRsvpEvent' || type === 'eventCreateEvent'
    ? `*${plan.message}*

Time: ${plan.time.toLocaleString('en-GB', {
    timeZone: config.timezone,
    weekday: 'long',
    minute: '2-digit',
    hour: '2-digit',
    day: '2-digit',
    month: 'long'
  })}
Location: ${plan.location || '(none)'}

Going (${going.length}): ${going.length > 10 ? going.slice(0, 10).join(', ') + ` and ${going.length - 10} more...` : going.join(', ')}
Can't go (${declined.length}): ${declined.length > 10 ? declined.slice(0, 10).join(', ') + ` and ${declined.length - 10} more...` : declined.join(', ')}
` : plan.message

  const channels = await connection.getWritableChannels()
  channels.forEach(async ({ channel }) => {
    channel.send({ embed: { title: `Event: **${plan.title}**`, description } })
  })

  const threads = connection.getOtherWritableThreads(plan.threadId)
  threads.forEach(async _thread => {
    log.debug('Sending Messenger message')
    const info = await messenger.client.sendMessage(Number(_thread.id), `_${thread.name} - ${plan.title}_:\n${description}`)
    log.trace('sent message info', info)
    log.debug('Sent message on Messenger')
  })
}
