const Command = require('./Command')
const getFBLink = id => `[\`${id}\`](https://facebook.com/messages/t/${id})`
const e = endpoint => `\`${endpoint.type}\`: ${endpoint.type === 'messenger' ? getFBLink(endpoint.id) : `<#${endpoint.id}>`}${endpoint.readonly ? ' (readonly)' : ''}`

module.exports = new Command({
  argc: 1,
  usage: `info <connection name/Discord channel ID/Facebook thread ID>`,
  example: `info test-connection`
}, async (argv, reply) => {
  let name = argv[0]
  let connection = connections.list.get(name)
  if (!connection) connection = connections.list.filter(connection => connection.some(endpoint => endpoint.id === name)).map((value, key) => { name = key; return value })[0]
  if (!connection) return reply(`Connection \`${name}\` not found!`)
  reply({ embed: {
    title: `Connection: ${name}`,
    description: `${connection.map(e).join('\n')}`
  }})
})
