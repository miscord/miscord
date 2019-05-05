import Command from './Command'

export default new Command(async argv => {
  const [name] = argv
  const connection = connections.get(name)
  if (!connection) return `Connection \`${name}\` not found!`
  await connection.delete()
  return `Connection \`${name}\` was removed successfully!`
}, {
  argc: 1,
  usage: `remove <connection name>`,
  example: `remove test-connection`
})
