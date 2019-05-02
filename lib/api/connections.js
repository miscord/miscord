const Connection = require('../Connection')
const schema = require('./schema')

module.exports = async app => {
  app.get('/', (request, reply) => {
    reply.send(connections.list.map(connection => connection.toObject()))
  })

  app.post('/', {
    schema: {
      body: schema.connection
    }
  }, async (request, reply) => {
    if (connections.get(request.body.name)) {
      return reply.code(409).send(new Error('Connection already exists'))
    }
    const connection = await new Connection(request.body.name).save()
    if (request.body.endpoints && request.body.endpoints.length) {
      for (let endpoint of request.body.endpoints) {
        await connection.addEndpoint(endpoint)
      }
    }
    reply.send(connection.toObject())
  })

  app.get('/:name', (request, reply) => {
    const { name } = request.params
    const connection = connections.get(name)

    if (!connection) return reply.code(404).send(new Error(`Connection ${name} not found!`))

    reply.send(connection.toObject())
  })

  app.delete('/:name', async (request, reply) => {
    const { name } = request.params
    const connection = connections.get(name)

    if (!connection) return reply.code(404).send(new Error(`Connection ${name} not found!`))

    await connection.remove()
    return reply.send(connection.toObject())
  })

  app.get('/:name/endpoints', (request, reply) => {
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
