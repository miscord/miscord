import { Server } from '../types/fastify'
import Thread from '../types/Thread'

function thread ({ name, id, isGroup }: Thread) {
  return { name, id, isGroup }
}

export default async (app: Server) => {
  app.get('/threads', async (request, reply) => {
    return Array.from(messenger.threads.values()).map(thread)
  })
}
