const log = logger.withScope('handleCommand')
const commands = require('./commands')

module.exports = (message, sender) => {
  log.info('Command received!')
  message = message.trim()
  let command = message.trim().split(' ')[0]
  const argv = message.replace(command, '').split(' ').map(str => str.trim()).filter(str => str)
  if (!command) command = 'help'
  if (!Object.keys(commands).includes(command)) return discord.commandChannel.send(`Command \`${command}\` not found!`)
  if (command === 'eval' && !discord.guilds.getAll('members').find(member => member.id === sender.id).hasPermission('ADMINISTRATOR')) return discord.commandChannel.send(`You have no permission!`)
  commands[command].run(argv)
}
