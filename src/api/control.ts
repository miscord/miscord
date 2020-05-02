import fs from 'fs-extra'
import FileConfig from '../config/FileConfig'
import path from 'path'
import { FastifyInstance } from 'fastify'

export default function useControl (app: FastifyInstance): void {
  app.get('/logs', async (request, reply) => {
    if (!(config instanceof FileConfig)) return reply.send([])
    const count = request.query.count || 100

    const logsFolderPath = path.join(path.parse(config.path).dir, 'logs')
    const logs = await fs.readdir(logsFolderPath)
    const file = await fs.readFile(path.join(logsFolderPath, logs.slice(-1)[0]), 'utf8')
    const lines = file.split('\n')

    return lines.slice(-count)
  })

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
    await close(2)
  })

  app.post('/quit', async (request, reply) => {
    reply.send({})
    await close(0)
  })
}

async function close (code: number): Promise<void> {
  await discord.client.destroy()
  logger.success('Logged out from Discord')
  console.error('close ' + code.toString())
}
