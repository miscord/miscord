import Command from './Command'

export default new Command(async argv => {
  let [name, id, value] = argv
  if (value !== 'true' && value !== 'false') return `Wrong value: \`${value}\`! Correct values: \`true\`, \`false\``
  let connection = connections.get(name)
  if (!connection) return `Connection \`${name}\` not found!`
  if (!connection.hasEndpoint(id)) return `Endpoint \`${id}\` not found in connection \`${name}\`!`
  await connection.markEndpointAsReadonly(id, value === 'true').save()
  return `Endpoint ${id}@${name} is ${value === 'true' ? 'now' : 'no longer'} read only!`
}, {
  argc: 3,
  usage: `readonly <connection name> <endpoint ID> <true/false>`,
  example: `readonly test-connection 1234 true`
})
