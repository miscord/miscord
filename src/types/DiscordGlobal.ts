import { Client, CategoryChannel, Collection, Webhook, TextChannel, DMChannel } from 'discord.js'
import GuildArray from './GuildArray'

export default interface DiscordGlobal {
  client: Client
  guilds: GuildArray
  category?: CategoryChannel
  channels: {
    command?: (TextChannel | DMChannel)[]
    error?: (TextChannel | DMChannel)
  }
  webhooks: Collection<string, Webhook>
  getChannel (channelId: string): TextChannel
}
