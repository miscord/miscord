import { DMChannel, TextChannel } from 'discord.js'

const log = logger.withScope('discord:handleMentions')

export default function handleMentions (message: string, channel: (TextChannel | DMChannel)): string {
  // Goes through the message replacing mentions with escaped mentions if massMentions is disabled.
  const massMentions = [ '@everyone', '@here' ]
  if (massMentions.some(massMention => message.includes(massMention)) && !config.discord.massMentions) {
    massMentions.forEach(massMention => { message = message.replace(new RegExp(massMention, 'g'), `\`${massMention}\``) })
  }

  if (!channel || channel instanceof DMChannel) return message

  if (config.discord.roleMentions) {
    for (const role of channel.guild.roles.array()) {
      message = replaceCaseInsensitive(message, `@${role.name}`, role.toString())
    }
  }

  if (config.discord.userMentions) {
    for (const member of channel.members.array()) {
      message = replaceCaseInsensitive(message, `@${member.user.username}`, member.toString())
      if (member.nickname) {
        message = replaceCaseInsensitive(message, `@${member.nickname}`, member.toString())
      }
    }
  }

  log.trace('message', message)
  return message
}

function replaceCaseInsensitive (str: string, searchString: string, replaceString: string): string {
  const index = str.toLowerCase().indexOf(searchString.toLowerCase())
  if (index === -1) return str
  return str.slice(0, index) + replaceString + str.slice(index + searchString.length, str.length)
}
