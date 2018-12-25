const Command = require('./Command')

module.exports = new Command(_ => {
  let arr = []
  for (let [name] of connections.list.entries()) arr.push('`' + name + '`')
  return { embed: { title: 'Connections:', description: arr.join('\n') } }
})
