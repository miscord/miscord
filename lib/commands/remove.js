const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `remove <connection name>`,
  example: `remove test-connection`
}, async argv => {
  const [ name ] = argv
  if (!connections.get(name)) return `Connection \`${name}\` not found!`
  connections.list.delete(name)
  await connections.save()
  return `Connection \`${name}\` was removed successfully!`
})
