import dotProp from 'dot-prop'
import { Server } from '../types/fastify'

export default async (app: Server) => {
  app.get('/', (request, reply) => {
    reply.send(config.config)
  })

  app.get('/:path', async (request, reply) => {
    const value = dotProp.get(config.config, request.params.path)
    if (value == null) return reply.code(404).send(new Error(`Config property ${request.params.path} does not exist!`))
    reply.send(value)
  })

  app.post('/:path', async (request, reply) => {
    await config.set(request.params.path, request.body)
    reply.send(request.body)
  })

  app.delete('/:path', async (request, reply) => {
    await config.set(request.params.path, null)
    reply.code(200).send()
  })
}
