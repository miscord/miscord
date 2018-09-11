const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `add <connection name>`,
  example: `add test-connection`
}, (argv, reply) => {
  const name = argv[0]
  if (connections.list.has(name)) return `Connection \`${name}\` already exists!`
  connections.list.set(name, [])
  connections.save()
  reply(`Connection \`${name}\` was added successfully!`)
})
