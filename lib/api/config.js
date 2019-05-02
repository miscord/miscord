const dotProp = require('dot-prop')
const saveConfig = require('../config/saveConfig')

module.exports = async app => {
  app.get('/', (request, reply) => {
    reply.send(config)
  })

  app.get('/:path', (request, reply) => {
    const value = dotProp.get(config, request.params.path)
    if (value == null) return reply.code(404).send(new Error(`Config property ${request.params.path} does not exist!`))
    reply.send(value)
  })

  app.post('/:path', async (request, reply) => {
    dotProp.set(config, request.params.path, request.body)
    await saveConfig()
    reply.send(request.body)
  })

  app.delete('/:path', async (request, reply) => {
    dotProp.delete(config, request.params.path)
    await saveConfig()
    reply.code(200).send()
  })
}
