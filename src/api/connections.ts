import { Server } from '../types/fastify'

import Connection from '../Connection'
import schema from './schema'

export default async (app: Server) => {
  app.get('/', (request, reply) => {
    reply.send(connections.list.map(connection => connection.toObject()))
  })

  app.post('/', {
    schema: {
      body: schema.connection
    }
  }, async (request, reply) => {
    if (connections.has(request.body.name)) return reply.sendError(409, `Connection already exists!`)

    const connection = await new Connection(request.body.name).save()
    if (request.body.endpoints && request.body.endpoints.length) {
      for (let endpoint of request.body.endpoints) {
        await connection.addEndpoint(endpoint)
      }
    }

    reply.send(connection.toObject())
  })

  app.get('/:name', async (request, reply) => {
    const { name } = request.params
    const connection = connections.get(name)

    if (!connection) return reply.code(404).send(new Error(`Connection ${name} not found!`))

    reply.send(connection.toObject())
  })

  app.delete('/:name', async (request, reply) => {
    const { name } = request.params
    const connection = connections.get(name)

    if (!connection) return reply.code(404).send(new Error(`Connection ${name} not found!`))

    await connection.delete()
    return reply.send(connection.toObject())
  })

  app.get('/:name/endpoints', async (request, reply) => {
    const { name } = request.params
    const connection = connections.get(name)

    if (!connection) return reply.code(404).send(new Error(`Connection ${name} not found!`))

    reply.send(connection.toObject().endpoints)
  })

  app.post('/:name/endpoints', {
    schema: {
      body: schema.endpoint
    }
  }, async (request, reply) => {
    const { name } = request.params
    const connection = connections.get(name)

    if (!connection) return reply.code(404).send(new Error(`Connection ${name} not found!`))
    if (connection.hasEndpoint(request.body.id)) {
      return reply.code(400).send(new Error(`Connection ${name} already has endpoint ${request.body.id}`))
    }

    await connection.addEndpoint(request.body)
    reply.send(connection.toObject().endpoints)
  })

  app.delete('/:name/endpoints/:id', async (request, reply) => {
    const { name, id } = request.params
    const connection = connections.get(name)

    if (!connection) return reply.code(404).send(new Error(`Connection ${name} not found!`))

    if (!connection.has(id)) return reply.code(404).send(new Error(`Connection ${name} doesn't have an endpoint ${id}!`))

    await connection.removeEndpoint(id)

    reply.send(connection.toObject().endpoints)
  })
}
