const Command = require('./Command')

module.exports = new Command({
  argc: 2,
  usage: `rename <connection name> <new name>`,
  example: `rename test-connection testing`
}, (argv, reply) => {
  const [ name, newName ] = argv
  const connection = connections.list.get(name)
  if (!connection) return reply(`Connection \`${name}\` not found!`)
  connections.list.delete(name)
  connections.list.set(newName, connection)
  reply(`Connection \`${name}\` successfully renamed to \`${newName}\`!`)
})
