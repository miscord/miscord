const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `remove <connection name>`,
  example: `remove test-connection`
}, (argv, reply) => {
  const [ name ] = argv
  const connection = connections.list.get(name)
  if (!connection) return reply(`Connection \`${name}\` not found!`)
  connections.list.delete(name)
  connections.save()
  reply(`Connection \`${name}\` was removed successfully!`)
})
