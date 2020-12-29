/* eslint-disable @typescript-eslint/require-await */
import { Guild as DiscordGuild, GuildChannel, GuildMember } from 'discord.js'
import { FastifyError, FastifyInstance } from 'fastify'

interface Channel {
  type: string
  name: string
  id: string
  category: string | null
}

function channel ({ type, name, id, parent }: GuildChannel): Channel {
  return { type, name, id, category: parent ? parent.id : null }
}

interface Member {
  nickname: string | null
  username: string
  discriminator: string
}

function member ({ nickname, user: { discriminator, username } }: GuildMember): Member {
  return { nickname, username, discriminator }
}

interface Guild {
  name: string
  id: string
  channels?: Channel[]
  users?: Member[]
}

function guildWithChannels ({ name, id, channels }: DiscordGuild): Guild {
  return { name, id, channels: channels.array().map(channel) }
}

function guildWithUsers ({ name, id, members }: DiscordGuild): Guild {
  return { name, id, users: members.array().map(member) }
}

export default function useDiscord (app: FastifyInstance, options: any, next: (err?: FastifyError) => void): void {
  app.get('/channels', async (request, reply) => {
    return discord.client.guilds.array().map(guildWithChannels)
  })

  app.get('/users', async (request, reply) => {
    return discord.client.guilds.array().map(guildWithUsers)
  })

  app.get('/guilds/:guild/channels', async (request, reply) => {
    if (!discord.client.guilds.has(request.params.guild)) return reply.sendError(404, 'Guild not found')
    return discord.client.guilds.get(request.params.guild)?.channels.array().map(channel) ?? []
  })

  next()
}
