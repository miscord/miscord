import { Message } from 'discord.js'
import { DiscordMessageData } from '../MessageData'

export default function toDiscord (message: Message): DiscordMessageData {
  return {
    body: message.type !== 'PINS_ADD'
      ? message.content
      : `<@${message.author.id}> pinned a message to channel <#${message.channel.id}>.`,
    opts: {
      embeds: message.embeds,
      username: message.author.username,
      avatarURL: message.author.avatarURL,
      files: message.attachments.map(attachment => ({ attachment: attachment.url, name: attachment.filename }))
    }
  }
}
