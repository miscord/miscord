import { Server } from '../types/fastify'

export default async (app: Server) => {
  app.get('/threads', async (request, reply) => {
    return messenger.threads
  })
}
