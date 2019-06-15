import Command from './Command'

export default new Command(async argv => {
  let [ name ] = argv
  let connection = connections.get(name)
  if (!connection) {
    connection = connections.getWith(name)
  }
  if (!connection) return `Connection \`${name}\` not found!`
  return {
    embed: {
      title: `Connection: ${connection.name}`,
      description: connection.getPrintable()
    }
  }
}, {
  argc: 1,
  usage: `info <connection name/Discord channel ID/Facebook thread ID>`,
  example: `info test-connection`
})
