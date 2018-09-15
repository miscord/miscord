const log = require('npmlog')

const { getThread, getSender, getChannelName, filter } = require('./index')

module.exports = async message => {
  log.silly('handlePlan: plan', message)

  const thread = await getThread(message.threadID)
  log.verbose('handlePlan', 'Got Messenger thread')
  log.silly('handlePlan: thread', thread)

  // handle whitelist
  if (!filter(await getChannelName(thread), message.threadID)) return

  const people = message.event_data.guest_state_list
  const going = (await Promise.all(people.filter(el => el.guest_list_state === 'GOING').map(el => getSender(el.node.id)))).map(el => el.name)
  const declined = (await Promise.all(people.filter(el => el.guest_list_state === 'DECLINED').map(el => getSender(el.node.id)))).map(el => el.name)

  const { event_location_name: location, latitude, longitude } = message.event_data

  const description =
`*${message.body}*

Time: ${new Date(message.event_data.event_time * 1000).toLocaleString('en-GB', {
    timeZone: config.timezone,
    weekday: 'long',
    minute: '2-digit',
    hour: '2-digit',
    day: '2-digit',
    month: 'long'
  })}
Location: ${location ? latitude !== '0' ? `[${location}](https://google.com/maps/place/${latitude},${longitude})` : location : '(none)'}

Going (${going.length}): ${going.length > 10 ? going.slice(0, 10).join(', ') + `and ${going.length - 10} more...` : going.join(', ')}
Can't go (${declined.length}): ${declined.length > 10 ? declined.slice(0, 10).join(', ') + `and ${declined.length - 10} more...` : declined.join(', ')}
`

  const channels = await connections.getChannels(message.threadID, thread.name)
  if (channels.length) {
    channels.forEach(async channel => {
      channel.send({ embed: { title: `Event: **${message.event_data.event_title}**`, description } })
    })
  }
}
