const Command = require('./Command')
const { getThread, getChannelName } = require('../messenger')

module.exports = new Command({
  argc: 3,
  usage: `link <connection name> <type (discord/messenger)> <ID>`,
  example: `link test-connection messenger 1616656375118166`
}, async (argv, reply) => {
  const [ name, type, id ] = argv
  const connection = connections.list.get(name)
  if (!connection) return `Connection \`${name}\` not found!`
  if (type !== 'discord' && type !== 'messenger') return reply(`Wrong type: ${type}! Correct types: \`discord\`, \`messenger\``)
  if (type === 'discord') {
    const channel = discord.client.channels.find(channel => channel.id === id || channel.name === id)
    if (!channel) return reply(`Discord channel \`${id}\` not found!`)
    connection.push({
      type,
      id,
      name: channel.name
    })
  } else {
    const thread = await getThread(id)
    if (!thread) return reply(`Messenger thread \`${id}\` not found!`)
    connection.push({
      type,
      id,
      name: await getChannelName(thread)
    })
  }
  connections.save()
  reply(`${type === 'discord' ? `Discord channel` : `Messenger thread`} \`${id}\` has been added successfully!`)
})
