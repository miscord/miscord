import Command from './Command'

export default new Command(async argv => {
  const [name, newName] = argv
  const connection = connections.get(name)
  if (!connection) return `Connection \`${name}\` not found!`
  await connection.rename(newName)
  return `Connection \`${name}\` successfully renamed to \`${newName}\`!`
}, {
  argc: 2,
  usage: `rename <connection name> <new name>`,
  example: `rename test-connection testing`
})
