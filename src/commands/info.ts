import Command from './Command'

export default new Command(([ name ]) => {
  let connection
  if (connections.has(name)) {
    connection = connections.get(name)
  } else {
    if (connections.hasWith(name)) {
      connection = connections.getWith(name)
    }
  }
  if (!connection) return `Connection \`${name}\` not found!`
  return {
    embed: {
      title: `Connection: ${connection.name}` + (connection.disabled ? ' (disabled)' : ''),
      description: connection.getPrintable()
    }
  }
}, {
  argc: 1,
  usage: 'info <connection name/Discord channel ID/Messenger thread ID>',
  example: 'info test-connection'
})
