const Command = require('./Command')
const { getThread } = require('../messenger')

module.exports = new Command({
  argc: 3,
  usage: `link <connection name> <type (discord/messenger)> <ID>`,
  example: `link test-connection messenger 1616656375118166`
}, async argv => {
  const [ name, type, id ] = argv
  const connection = connections.get(name)
  if (!connection) return `Connection \`${name}\` not found!`
  if (type !== 'discord' && type !== 'messenger') return `Wrong type: ${type}! Correct types: \`discord\`, \`messenger\``
  if (type === 'discord') {
    const channel = discord.client.channels.find(channel => channel.id === id || channel.name === id)
    if (!channel) return `Discord channel \`${id}\` not found!`
    await connection
      .addChannel({
        id,
        name: channel.name
      })
      .save()
  } else {
    let thread
    try {
      thread = await getThread(id)
    } catch (err) {
      return `Messenger thread \`${id}\` not found!`
    }
    await connection
      .addThread({
        id,
        name: thread.name
      })
      .save()
  }
  return `${type === 'discord' ? `Discord channel` : `Messenger thread`} \`${id}\` has been added successfully!`
})
