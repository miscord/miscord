const Command = require('./Command')
const Connection = require('../Connection')

module.exports = new Command({
  argc: 1,
  usage: `add <connection name>`,
  example: `add test-connection`
}, async argv => {
  const name = argv[0]
  if (connections.list.has(name)) return `Connection \`${name}\` already exists!`
  await new Connection(name).save()
  return `Connection \`${name}\` was added successfully!`
})
