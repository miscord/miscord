import Command from './Command'

export default new Command(async ([ name, newName ]) => {
  if (!connections.has(name)) return `Connection \`${name}\` not found!`

  await connections.get(name).rename(newName).save()

  return `Connection \`${name}\` successfully renamed to \`${newName}\`!`
}, {
  argc: 2,
  usage: 'rename <connection name> <new name>',
  example: 'rename test-connection testing'
})
