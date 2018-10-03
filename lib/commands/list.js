const Command = require('./Command')

module.exports = new Command((_, reply) => {
  let arr = []
  for (let [name] of connections.list.entries()) arr.push('`' + name + '`')
  reply({ embed: { title: 'Connections:', description: arr.join('\n') } })
})
