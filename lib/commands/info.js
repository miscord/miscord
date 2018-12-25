const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `info <connection name/Discord channel ID/Facebook thread ID>`,
  example: `info test-connection`
}, async argv => {
  let name = argv[0]
  let connection = connections.get(name)
  if (!connection) {
    connection = connections.getWith(name)
    name = connection.name
  }
  if (!connection) return `Connection \`${name}\` not found!`
  return {
    embed: {
      title: `Connection: ${name}`,
      description: connection.getPrintable()
    }
  }
})
