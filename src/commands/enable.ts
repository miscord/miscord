import Command from './Command'

export default new Command(async ([ name ]) => {
  if (!connections.has(name)) return `Connection \`${name}\` not found!`
  const connection = connections.get(name)

  if (!connection.disabled) return `Connection \`${name}\` is already enabled!`
  await connection.enable().save()
  return `Connection \`${name}\` is now enabled!`
}, {
  argc: 1,
  usage: 'enable <connection name>',
  example: 'enable connection-test'
})
