const log = logger.withScope('handleCommand')

import { TextChannel, User } from 'discord.js'
import { hasAdmin } from './utils'
import * as commands from './commands'
import { TextBasedChannel } from './types/TextBasedChannel'

export default ({ content, author, channel }: { content: string, author: User, channel: TextBasedChannel }) => {
  log.info('Command received!')
  content = content.trim()

  let command = content.split(' ')[0]
  const argv = content.replace(command, '')
    .split(' ')
    .map(str => str.trim())
    .filter(str => str)

  if (!command) command = 'help'

  if (!Object.keys(commands).includes(command)) return channel.send(`Command \`${command}\` not found!`)
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
