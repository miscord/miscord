import Command from './Command'

export default new Command(() => {
  let arr = []
  for (let [name] of connections.list.entries()) arr.push('`' + name + '`')
  return { embed: { title: 'Connections:', description: arr.join('\n') } }
})
