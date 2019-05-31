import { PlanEvent } from 'libfb'
import { default as MiscordThread } from '../types/Thread'
import { getSender, getThread } from './index'
import { truncatePeople } from '../utils'
import { EventType } from 'libfb/dist'

const log = logger.withScope('messenger:handlePlan')

export default async (_event: { event: PlanEvent, type: EventType }) => {
  log.trace('plan', _event)
  const { event: plan, type } = _event

  if (!config.messenger.handlePlans) return

  const thread = await getThread(plan.threadId)
  if (!thread) return
  log.debug('Got Messenger thread')
  log.trace('thread', thread, 1)

  let connection = await connections.getWithCreateFallback(plan.threadId, (thread as MiscordThread).cleanName!!)
  if (!connection) return

  const people = plan.guests
  const going = (await Promise.all(people.filter(el => el.state === 'GOING').map(el => getSender(el.id)))).map(el => el!!.name)
  const declined = (await Promise.all(people.filter(el => el.state === 'DECLINED').map(el => getSender(el.id)))).map(el => el!!.name)

  const description = ((type === 'planRsvpEvent' || type === 'planCreateEvent') && config.messenger.showPlanDetails)
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

Going (${going.length}): ${truncatePeople(going)}
Can't go (${declined.length}): ${truncatePeople(declined)}
` : plan.message

  const channels = await connection.getWritableChannels()
  channels.forEach(endpoint => {
    discord.getChannel(endpoint.id).send({ embed: { title: `Event: **${plan.title}**`, description } })
  })

  const threads = connection.getOtherWritableThreads(plan.threadId)
  threads.forEach(async _thread => {
    log.debug('Sending Messenger message')
    const info = await messenger.client.sendMessage(_thread.id, `_${thread.name} - ${plan.title}_:\n${description}`)
    log.trace('sent message info', info)
    log.debug('Sent message on Messenger')
  })
}
