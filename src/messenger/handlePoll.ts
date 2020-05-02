import { PollEvent, PollOption } from 'libfb'
import { getSender, getThread } from './index'
import { truncatePeople } from '../utils'
import { reportError } from '../error'

const log = logger.withScope('messenger:handlePoll')

export default async function handlePoll (_poll: { type: string, event: PollEvent }): Promise<void> {
  log.trace('poll', _poll)
  const { event: poll } = _poll

  if (!config.messenger.handlePolls) return

  const thread = await getThread(poll.threadId)
  log.debug('Got Messenger thread')
  log.trace('thread', thread, 1)

  const connection = await connections.getWithCreateFallback(poll.threadId.toString(), thread.cleanName)
  if (!connection) return

  const options = await Promise.all(poll.options.map(async option => {
    const pollOption: PollOption = {
      ...option,
      voters: (await Promise.all(option.voters.map(voter => getSender(voter)))).map(el => el?.name ?? el.id)
    }
    return pollOption
  }))

  const description = config.messenger.showPollDetails
    ? `*${poll.message}*
${options.map(option => `${option.title} (${option.voteCount}): ${truncatePeople(option.voters)}`).join('\n')}
` : poll.message

  const channels = await connection.getWritableChannels()
  channels.forEach(endpoint => {
    discord.getChannel(endpoint.id).send({ embed: { title: `Poll: **${poll.title}**`, description } })
      .catch(err => reportError(err))
  })

  const threads = connection.getOtherWritableThreads(poll.threadId.toString())
  await Promise.all(threads.map(async _thread => {
    log.debug('Sending Messenger message')
    const info = await messenger.client.sendMessage(_thread.id, `_${thread.name} - ${poll.title}_:\n${description}`)
    log.trace('sent message info', info)
    log.debug('Sent message on Messenger')
  }))
    .catch(err => reportError(err))
}
