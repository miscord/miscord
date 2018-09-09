const log = require('npmlog')
const commands = require('./commands')

module.exports = message => {
  log.info('handleCommand', 'Command received!')
  message = message.trim()
  let command = message.trim().split(' ')[0]
  const argv = message.replace(command, '').split(' ').map(str => str.trim()).filter(str => str)
  if (!command) command = 'help'
  if (!Object.keys(commands).includes(command)) return discord.commandChannel.send(`Command \`${command}\` not found!`)
  commands[command].run(argv)
}
