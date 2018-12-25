const Command = require('./Command')

module.exports = new Command({
  argc: 2,
  usage: `unlink <connection name> <ID>`,
  example: `unlink test-connection 1616656375118166`
}, async argv => {
  const [ name, id ] = argv
  const connection = connections.get(name)
  if (!connection) return `Connection ${name} not found`
  await connection.removeEndpoint(id).save()
  return `Endpoint \`${id}\` was removed successfully from connection \`${name}\`!`
})
