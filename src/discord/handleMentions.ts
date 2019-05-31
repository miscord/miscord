const log = logger.withScope('discord:handleMentions')

import { TextChannel } from 'discord.js'

export default function handleMentions (message: string, channel: TextChannel) {
  // Goes through the message replacing mentions with escaped mentions if massMentions is disabled.
  const massMentions = ['@everyone', '@here']
  if (massMentions.some(massMention => message.includes(massMention)) && !config.discord.massMentions) {
    massMentions.forEach(massMention => { message = message.replace(new RegExp(massMention, 'g'), `\`${massMention}\``) })
  }
  // If no matches, or usermentions is disabled, return.
  if (!config.discord.userMentions) return message

  for (let role of channel.guild.roles.array()) {
    message = replaceCaseInsensitive(message, `@${role.name}`, role.toString())
  }

  for (let member of channel.members.array()) {
    message = replaceCaseInsensitive(message, `@${member.user.username}`, member.toString())
    message = replaceCaseInsensitive(message, `@${member.nickname}`, member.toString())
  }

  log.trace('message', message)
  return message
}
function replaceCaseInsensitive (str: string, searchString: string, replaceString: string) {
  const index = str.toLowerCase().indexOf(searchString.toLowerCase())
  if (index === -1) return str
  return str.slice(0, index) + replaceString + str.slice(index + searchString.length, str.length)
}
