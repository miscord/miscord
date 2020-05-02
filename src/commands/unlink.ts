import Command from './Command'

export default new Command(async ([ name, id ]) => {
  if (!connections.has(name)) return `Connection \`${name}\` not found!`

  const connection = connections.get(name)
  if (!connection.hasEndpoint(id)) return `Endpoint \`${id}\` not found in connection \`${name}\`!`
  await connection.removeEndpoint(id)

  return `Endpoint \`${id}\` was removed successfully from connection \`${name}\`!`
}, {
  argc: 2,
  usage: 'unlink <connection name> <ID>',
  example: 'unlink test-connection 1616656375118166'
})
