const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `info <connection name/Discord channel ID/Facebook thread ID>`,
  example: `info test-connection`
}, async (argv, reply) => {
  let name = argv[0]
  const getFBLink = id => `[\`${id}\`](https://facebook.com/messages/t/${id})`
  let connection = connections.list.get(name)
  if (!connection) connection = connections.list.filter(connection => connection.some(endpoint => endpoint.id === name)).map((value, key) => { name = key; return value })[0]
  if (!connection) return reply(`Connection \`${name}\` not found!`)
  reply({ embed: {
    title: `Connection: ${name}`,
    description: `${connection.map(endpoint => `\`${endpoint.type}\`: ${endpoint.type === 'messenger' ? getFBLink(endpoint.id) : `<#${endpoint.id}>`}`).join('\n')}`
  }})
})
