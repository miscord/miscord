/* eslint-disable @typescript-eslint/require-await */
import MessengerThread from '../types/Thread'
import { FastifyInstance } from 'fastify'

interface Thread {
  name: string
  id: string
  isGroup: boolean
}

function thread ({ name, id, isGroup }: MessengerThread): Thread {
  return { name, id, isGroup }
}

export default function useMessenger (app: FastifyInstance): void {
  app.get('/threads', async (request, reply) => {
    return Array.from(messenger.threads.values()).map(thread)
  })
}
