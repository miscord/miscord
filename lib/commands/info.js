const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `info <connection name>`,
  example: `info test-connection`
}, async (argv, reply) => {
  const name = argv[0]
  const getFBLink = id => `[\`${id}\`](https://facebook.com/messages/t/${id})`
  const connection = connections.list.get(name)
  if (!connection) return reply(`Connection \`${name}\` not found!`)
  reply({ embed: {
    title: `Connection: ${name}`,
    description: `${connection.map(endpoint => `\`${endpoint.type}\`: ${endpoint.type === 'messenger' ? getFBLink(endpoint.id) : `<#${endpoint.id}>`}`).join('\n')}`
  }})
})
