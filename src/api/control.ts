import { Server } from '../types/fastify'

export default async (app: Server) => {
  app.get('/status', (request, reply) => {
    reply.send({ status: config.paused ? 'paused' : 'running' })
  })
  app.post('/pause', (request, reply) => {
    config.paused = true
    reply.send({ status: 'paused' })
  })
  app.post('/unpause', (request, reply) => {
    config.paused = false
    reply.send({ status: 'running' })
  })
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
