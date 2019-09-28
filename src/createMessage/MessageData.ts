import { WebhookMessageOptions } from 'discord.js'

interface MessageData {
  body: string
}
export interface MessengerMessageData extends MessageData {
  attachments: {
    filePath: string
    extension: string
  }[]
}
export interface DiscordMessageData extends MessageData {
  opts: WebhookMessageOptions
}
