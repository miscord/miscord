import Command from './Command'

export default new Command(async ([ name, type, id ]) => {
  if (!connections.has(name)) return `Connection \`${name}\` not found!`

  const connection = connections.get(name)
  if (type !== 'discord' && type !== 'messenger') return `Wrong type: ${type}! Correct types: \`discord\`, \`messenger\``

  try {
    await connection.addEndpoint({ id, type })
  } catch (err) {
    return err.message
  }

  return `${type === 'discord' ? `Discord channel` : `Messenger thread`} \`${id}\` has been added successfully!`
}, {
  argc: 3,
  usage: `link <connection name> <type (discord/messenger)> <ID>`,
  example: `link test-connection messenger 1616656375118166`
})
