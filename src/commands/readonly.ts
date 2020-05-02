import Command from './Command'

export default new Command(async ([ name, id, value ]) => {
  if (value !== 'true' && value !== 'false') return `Wrong value: \`${value}\`! Correct values: \`true\`, \`false\``
  if (!connections.has(name)) return `Connection \`${name}\` not found!`

  const connection = connections.get(name)
  if (!connection.hasEndpoint(id)) return `Endpoint \`${id}\` not found in connection \`${name}\`!`
  await connection.markEndpointAsReadonly(id, value === 'true').save()

  return `Endpoint ${id}@${name} is ${value === 'true' ? 'now' : 'no longer'} read only!`
}, {
  argc: 3,
  usage: 'readonly <connection name> <endpoint ID> <true/false>',
  example: 'readonly test-connection 1234 true'
})
