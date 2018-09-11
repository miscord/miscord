const Command = require('./Command')

module.exports = new Command({
  argc: 2,
  usage: `unlink <connection name> <ID>`,
  example: `unlink test-connection 1616656375118166`
}, (argv, reply) => {
  const [ name, id ] = argv
  const connection = connections.list.get(name)
  if (!connection) return reply(`Connection ${name} not found`)
  connections.list.set(connection.filter(endpoint => endpoint.id !== id))
  connections.save()
  reply(`Endpoint \`${id}\` was removed successfully from connection \`${name}\`!`)
})
