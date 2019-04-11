const Command = require('./Command')

module.exports = new Command({
  argc: 3,
  usage: `link <connection name> <type (discord/messenger)> <ID>`,
  example: `link test-connection messenger 1616656375118166`
}, async argv => {
  const [ name, type, id ] = argv
  const connection = connections.get(name)
  if (!connection) return `Connection \`${name}\` not found!`
  if (type !== 'discord' && type !== 'messenger') return `Wrong type: ${type}! Correct types: \`discord\`, \`messenger\``
  await connection.linkEndpoint({ id, type })
  return `${type === 'discord' ? `Discord channel` : `Messenger thread`} \`${id}\` has been added successfully!`
})
