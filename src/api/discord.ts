import { Server } from '../types/fastify'

export default async (app: Server) => {
  app.get('/guilds', async (request, reply) => {
    return discord.client.guilds.array()
  })
  app.get('/guilds/:guild/channels', async (request, reply) => {
    return discord.client.guilds.get(request.params.guild)!!.channels.array()
  })
}
