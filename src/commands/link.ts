import Command from './Command'

export default new Command(async argv => {
  let [ name, type, id ] = argv
  const connection = connections.get(name)
  if (!connection) return `Connection \`${name}\` not found!`
  if (type !== 'discord' && type !== 'messenger') return `Wrong type: ${type}! Correct types: \`discord\`, \`messenger\``
  const endpointType: 'discord' | 'messenger' = type
  try {
    await connection.addEndpoint({ id, type: endpointType })
  } catch (err) {
    return err.message
  }
  return `${type === 'discord' ? `Discord channel` : `Messenger thread`} \`${id}\` has been added successfully!`
}, {
  argc: 3,
  usage: `link <connection name> <type (discord/messenger)> <ID>`,
  example: `link test-connection messenger 1616656375118166`
})
