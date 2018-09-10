const Command = require('./Command')

module.exports = new Command({
  argc: 3,
  usage: `readonly <connection name> <endpoint ID> <true/false>`,
  example: `readonly test-connection 1234 true`
}, async (argv, reply) => {
  let [ name, id, value ] = argv
  if (value !== 'true' && value !== 'false') return reply(`Wrong value: \`${value}\`! Correct values: \`true\`, \`false\` `)
  let connection = connections.list.get(name)
  if (!connection) return reply(`Connection \`${name}\` not found!`)
  const endpoint = connection.find(endpoint => endpoint.id === id)
  const index = connection.findIndex(endpoint => endpoint.id === id)
  if (!endpoint) return reply(`Endpoint \`${id}\` not found in connection \`${name}\`!`)
  endpoint.readonly = value === 'true'
  connection[index] = endpoint
  connections.save()
  reply(`Endpoint ${id}@${name} is ${value === 'true' ? 'now' : 'no longer'} read only!`)
})
