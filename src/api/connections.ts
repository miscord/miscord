import { DoneFunction, Reply, Request, Server } from '../types/fastify'

import Connection from '../Connection'
import schema from './schema'

const checkConnection = {
  preHandler: function (request: Request, reply: Reply, done: DoneFunction) {
    const { name } = request.params
    if (!connections.has(name)) {
      reply.sendError(404, `Connection ${name} not found!`)
      return
    }
    done()
  }
}

export default async (app: Server) => {
  app.decorateRequest('getConnection', function (this: Request) {
    return connections.get(this.params.name)
  })

  app.get('/', (request, reply) => {
    reply.send(connections.map(connection => connection.toObject()))
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

  app.get('/:name', checkConnection, async (request, reply) => {
    const connection = request.getConnection()

    reply.send(connection.toObject())
  })

  app.post('/:name/disable', checkConnection, async (request, reply) => {
    const connection = request.getConnection()

    if (connection.disabled) {
      return reply.sendError(400, `Connection ${connection.name} is already disabled!`)
    }
    await connection.disable().save()

    reply.send(connection.toObject())
  })

  app.post('/:name/enable', checkConnection, async (request, reply) => {
    const connection = request.getConnection()

    if (!connection.disabled) {
      return reply.sendError(400, `Connection ${connection.name} is already enabled!`)
    }
    await connection.enable().save()

    reply.send(connection.toObject())
  })

  app.delete('/:name', checkConnection, async (request, reply) => {
    const connection = request.getConnection()

    await connection.delete()
    return reply.send(connection.toObject())
  })

  app.get('/:name/endpoints', checkConnection, async (request, reply) => {
    const connection = request.getConnection()

    reply.send(connection.toObject().endpoints)
  })

  app.post('/:name/endpoints', {
    schema: {
      body: schema.endpoint
    },
    ...checkConnection
  }, async (request, reply) => {
    const connection = request.getConnection()

    if (connection.hasEndpoint(request.body.id)) {
      return reply.sendError(400, `Connection ${connection.name} already has endpoint ${request.body.id}`)
    }

    await connection.addEndpoint(request.body)
    reply.send(connection.toObject().endpoints)
  })

  app.delete('/:name/endpoints/:id', checkConnection, async (request, reply) => {
    const connection = request.getConnection()
    const { id, name } = request.params

    if (!connection.has(id)) return reply.sendError(404, `Connection ${name} doesn't have an endpoint ${id}!`)

    await connection.removeEndpoint(id).save()

    reply.send(connection.toObject().endpoints)
  })
}
