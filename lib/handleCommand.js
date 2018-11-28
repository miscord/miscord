const log = logger.withScope('handleCommand')
const commands = require('./commands')
const hasAdmin = user => discord.guilds.getAll('members').find(member => member.id === user.id).hasPermission('ADMINISTRATOR')

module.exports = (message, sender) => {
  log.info('Command received!')
  message = message.trim()
  let command = message.trim().split(' ')[0]
  const argv = message.replace(command, '').split(' ').map(str => str.trim()).filter(str => str)
  if (!command) command = 'help'
  if (!Object.keys(commands).includes(command)) return discord.channels.command.send(`Command \`${command}\` not found!`)
  if (command === 'eval' && !hasAdmin(sender)) return discord.channels.command.send(`You have no permission!`)
  if (command === 'set' && argv[1].startsWith('`') && !hasAdmin(sender)) return discord.channels.command.send(`You have no permission!`)
  commands[command].run(argv)
}
