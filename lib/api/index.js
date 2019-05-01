const fastify = require('fastify')

module.exports = () => {
  const app = fastify()
  app.get('/', (request, reply) => reply.send({ info: 'Miscord v' + require('../../package.json').version }))
  app.register(require('./connections'), { prefix: '/connections' })
  app.register(require('./config'), { prefix: '/config' })

  app.listen(config.api.port || 8000, '0.0.0.0')
}
