import Command from './Command'

export default new Command(async ([ name ]) => {
  if (!connections.has(name)) return `Connection \`${name}\` not found!`

  await connections.get(name).delete()

  return `Connection \`${name}\` was removed successfully!`
}, {
  argc: 1,
  usage: `remove <connection name>`,
  example: `remove test-connection`
})
