const Command = require('./Command')

module.exports = new Command({
  argc: 2,
  usage: `rename <connection name> <new name>`,
  example: `rename test-connection testing`
}, async argv => {
  const [ name, newName ] = argv
  const connection = connections.get(name)
  if (!connection) return `Connection \`${name}\` not found!`
  await connection.rename(newName)
  return `Connection \`${name}\` successfully renamed to \`${newName}\`!`
})
