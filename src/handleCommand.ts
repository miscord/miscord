import { Message, TextChannel } from 'discord.js'
import { hasAdmin } from './utils'
import * as commands from './commands'

const log = logger.withScope('handleCommand')

export default function handleCommand (message: Message): void {
  log.info('Command received!')
  let { content, author, channel } = message
  content = content.trim()

  let command = content.split(' ')[0]
  const argv = content.replace(command, '')
    .split(' ')
    .map(str => str.trim())
    .filter(str => str)

  if (!command) command = 'help'

  if (!Object.keys(commands).includes(command)) {
    channel.send(`Command \`${command}\` not found!`)
      .catch(err => log.error(err))
    return
  }
  if (command === 'eval') {
    // can be unsafe?
    argv.unshift(
      channel instanceof TextChannel && !hasAdmin(author, channel.guild)
        ? 'no'
        : 'yes'
    )
  }

  // @ts-ignore
  commands[command].run(argv, channel)
}
