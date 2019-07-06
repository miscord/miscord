import { DMChannel, GroupDMChannel, Guild, TextChannel, User } from 'discord.js'
import commands from './commands'

const log = logger.withScope('handleCommand')
const hasAdmin = (user: User, guild: Guild) => guild.members.find(member => member.id === user.id).hasPermission('ADMINISTRATOR') || guild.ownerID === user.id

export default ({ content, author, channel }: { content: string, author: User, channel: TextChannel | DMChannel | GroupDMChannel }) => {
  log.info('Command received!')
  content = content.trim()

  let command = content.trim().split(' ')[0]
  const argv = content.replace(command, '').split(' ').map(str => str.trim()).filter(str => str)

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

  // @ts-ignore Somehow TypeScript still doesn't allow me to get a command this way...
  commands[command].run(argv, channel)
}
