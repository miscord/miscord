const Connection = require('../Connection')
const schema = require('./schema')

module.exports = async app => {
  app.get('/', (request, reply) => {
    reply.send(Object.assign({}, ...connections.list.map(connection => connection.toObject())))
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
    if (request.body && request.body.endpoints && request.body.endpoints.length) {
      for (let endpoint of request.body.endpoints) {
        await connection.addEndpoint(endpoint)
      }
    }
    reply.send({
      name: request.body.name,
      endpoints: connection.cleanEndpoints
    })
  })

  app.get('/:name', (request, reply) => {
    const connection = connections.get(request.params.id)
    if (!connection) return reply.code(404).send(new Error('Connection not found'))
    return reply.send(connection.toObject())
  })

  // app.patch('/:name', )

  app.get('/:name/endpoints', (request, reply) => {
    const connection = connections.get(request.params.name)
    if (!connection) return reply.code(404).send(new Error('Connection not found'))
    return connection.toObject().endpoints
  })

  app.post('/:name/endpoints', {
    schema: {
      body: schema.endpoint
    }
  }, async (request, reply) => {
    const connection = connections.get(request.params.name)
    if (!connection) return reply.code(404).send(new Error('Connection not found'))
    await connection.addEndpoint(request.body)
    await connection.save()
    reply.send(connection.toObject().endpoints)
  })
}
