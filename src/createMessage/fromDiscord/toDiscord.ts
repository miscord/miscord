import { Message } from 'discord.js'

export default (message: Message) => {
  return {
    body: message.type !== 'PINS_ADD' ? message.content : `<@${message.author.id}> pinned a message to this channel.`,
    opts: {
      embeds: message.embeds,
      username: message.author.username,
      avatarURL: message.author.avatarURL,
      files: message.attachments.map(attachment => ({ attachment: attachment.url, name: attachment.filename }))
    }
  }
}
