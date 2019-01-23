const log = logger.withScope('handleCommand')
const commands = require('./commands')
const hasAdmin = user => discord.guilds.getAll('members').find(member => member.id === user.id).hasPermission('ADMINISTRATOR')

module.exports = ({ content, author, channel }) => {
  log.info('Command received!')
  content = content.trim()
  let command = content.trim().split(' ')[0]
  const argv = content.replace(command, '').split(' ').map(str => str.trim()).filter(str => str)
  if (!command) command = 'help'
  if (!Object.keys(commands).includes(command)) return channel.send(`Command \`${command}\` not found!`)
  if (command === 'eval' && channel.type !== 'dm' && !hasAdmin(author)) return channel.send(`You have no permission!`)
  if (command === 'set' && argv[1] && argv[1].startsWith('`') && channel.type !== 'dm' && !hasAdmin(author)) return channel.send(`You have no permission!`)
  commands[command].run(argv, channel)
}
