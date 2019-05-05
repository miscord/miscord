import Command from './Command'

export default new Command(async argv => {
  const [name, id] = argv
  const connection = connections.get(name)
  if (!connection) return `Connection ${name} not found`
  await connection.removeEndpoint(id)
  return `Endpoint \`${id}\` was removed successfully from connection \`${name}\`!`
}, {
  argc: 2,
  usage: `unlink <connection name> <ID>`,
  example: `unlink test-connection 1616656375118166`
})
