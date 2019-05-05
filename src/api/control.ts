import { Server } from '../types/fastify'

export default async (app: Server) => {
  app.post('/restart', async (request, reply) => {
    reply.send({})
    await discord.client.destroy()
    logger.success('Logged out from Discord')
    console.error('close 2')
  })
  app.post('/quit', async (request, reply) => {
    reply.send({})
    await discord.client.destroy()
    logger.success('Logged out from Discord')
    console.error('close 0')
  })
}
