import Command from './Command'

export default new Command(async ([ name ]) => {
  if (!connections.has(name)) return `Connection \`${name}\` not found!`
  const connection = connections.get(name)

  if (connection.disabled) return `Connection \`${name}\` is already disabled!`
  await connection.disable().save()
  return `Connection \`${name}\` is now disabled!`
}, {
  argc: 1,
  usage: 'disable <connection name>',
  example: 'disable connection-test'
})
