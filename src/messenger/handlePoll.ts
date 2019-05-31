const log = logger.withScope('messenger:handlePoll')

import { PollEvent, PollOption } from 'libfb'
import { getSender, getThread } from './index'
import { truncatePeople } from '../utils'
import { default as MiscordThread } from '../types/Thread'

export default async (_poll: { type: string, event: PollEvent }) => {
  log.trace('poll', _poll)
  const { event: poll } = _poll

  if (!config.messenger.handlePolls) return

  const thread = await getThread(poll.threadId)
  log.debug('Got Messenger thread')
  log.trace('thread', thread, 1)

  let connection = await connections.getWithCreateFallback(poll.threadId.toString(), thread.cleanName)
  if (!connection) return

  const options = await Promise.all(poll.options.map(async option => {
    return {
      ...option,
      voters: (await Promise.all(option.voters.map(voter => getSender(voter)))).map(el => el!!.name)
    } as PollOption
  }))

  const description = config.messenger.showPollDetails
    ? `*${poll.message}*
${options.map(option => `${option.title} (${option.voteCount}): ${truncatePeople(option.voters)}`).join('\n')}
` : poll.message

  const channels = await connection.getWritableChannels()
  channels.forEach(endpoint => {
    discord.getChannel(endpoint.id).send({ embed: { title: `Poll: **${poll.title}**`, description } })
  })

  const threads = connection.getOtherWritableThreads(poll.threadId.toString())
  threads.forEach(async _thread => {
    log.debug('Sending Messenger message')
    const info = await messenger.client.sendMessage(_thread.id, `_${thread.name} - ${poll.title}_:\n${description}`)
    log.trace('sent message info', info)
    log.debug('Sent message on Messenger')
  })
}
