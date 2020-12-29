import dotProp from 'dot-prop'
import { FastifyError, FastifyInstance } from 'fastify'

export default function useConfig (app: FastifyInstance, options: any, next: (err?: FastifyError) => void): void {
  app.get('/', (request, reply) => {
    reply.send(config.config)
  })

  // eslint-disable-next-line @typescript-eslint/require-await
  app.get('/:path', async (request, reply) => {
    const value = dotProp.get(config.config, request.params.path)
    if (value == null) return reply.sendError(404, `Config property ${request.params.path as string} does not exist!`)
    reply.send(value)
  })

  app.post('/:path', async (request, reply) => {
    await config.set(request.params.path, request.body)
    reply.send(typeof request.body === 'string' ? JSON.stringify(request.body) : request.body)
  })

  app.delete('/:path', async (request, reply) => {
    await config.set(request.params.path, null)
    reply.code(200).send()
  })

  next()
}
