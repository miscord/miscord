import { EventType, PlanEvent, PollEvent } from 'libfb/dist'

const log = logger.withScope('messenger:handleEvent')

import { MessageEvent } from 'libfb'
import Connection from '../Connection'
import { getThread } from './index'
import handlePlan from './handlePlan'
import handlePoll from './handlePoll'
import { default as MiscordThread } from '../types/Thread'

export default async (_event: { event: MessageEvent, type: EventType }) => {
  log.trace('event', _event)
  const { event, type } = _event
  if (type === 'readReceiptEvent' || type === 'deliveryReceiptEvent') return

  if (type.startsWith('event')) return handlePlan({ type, event: event as PlanEvent })
  if (type.startsWith('poll')) return handlePoll({ type, event: event as PollEvent })

  if (!config.messenger.handleEvents) return

  const thread = await getThread(event.threadId, type !== 'threadNameEvent')
  log.debug('Got Messenger thread')
  log.trace('thread', thread, 1)
  if (!thread) return

  let connection = await connections.getWithCreateFallback(event.threadId.toString(), (thread as MiscordThread).cleanName!!)
  if (!connection) return

  if (type === 'threadNameEvent') await connection.checkChannelRenames(thread.name)

  const channels = connection.getWritableChannels()
  channels.forEach(async ({ channel }) => {
    channel!!.send(`*${(connection as Connection).getThreads().length > 1 ? thread.name + ': ' : ''}${event.message}*`)
  })

  const threads = connection.getOtherWritableThreads(event.threadId.toString())
  threads.forEach(async _thread => {
    log.debug('Sending Messenger message')
    const info = await messenger.client.sendMessage(_thread.id, `_${thread.name}: ${event.message}_`)
    log.trace('sent message info', info)
    log.debug('Sent message on Messenger')
  })
}
