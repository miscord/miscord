const log = logger.withScope('messenger:handlePoll')

const { getThread, getSender } = require('./index')
const { truncatePeople } = require('../utils')

module.exports = async _poll => {
  log.trace('poll', _poll)
  const { event: poll } = _poll

  if (!config.messenger.handlePolls) return

  const thread = await getThread(poll.threadId)
  log.debug('Got Messenger thread')
  log.trace('thread', thread, 1)

  let connection = await connections.getWithCreateFallback(poll.threadId, thread.cleanName)
  if (!connection) return

  poll.options = await Promise.all(poll.options.map(async option => {
    option.voters = (await Promise.all(option.voters.map(voter => getSender(voter)))).map(el => el.name)
    return option
  }))

  const description = config.messenger.showPollDetails
    ? `*${poll.message}*
${poll.options.map(option => `${option.title} (${option.voteCount}): ${truncatePeople(option.voters)}`).join('\n')}  
` : poll.message

  const channels = await connection.getWritableChannels()
  channels.forEach(async ({ channel }) => {
    channel.send({ embed: { title: `Poll: **${poll.title}**`, description } })
  })

  const threads = connection.getOtherWritableThreads(poll.threadId)
  threads.forEach(async _thread => {
    log.debug('Sending Messenger message')
    const info = await messenger.client.sendMessage(Number(_thread.id), `_${thread.name} - ${poll.title}_:\n${description}`)
    log.trace('sent message info', info)
    log.debug('Sent message on Messenger')
  })
}
