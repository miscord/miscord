const fastify = require('fastify')
const auth = require('basic-auth')
const log = logger.withScope('api')
const handlers = {
  connections: require('./connections'),
  config: require('./config')
}

module.exports = () => {
  const app = fastify()

  app.addHook('preHandler', (request, reply, next) => {
    if (!request.headers.authorization) {
      reply.code(401).header('WWW-Authenticate', 'Basic realm="Miscord API"').send()
      return
    }
    const { name, pass } = auth.parse(request.headers.authorization)
    log.debug('login', { name, pass })
    if (name === config.api.username && pass === config.api.password) return next()
    reply.code(403).send(new Error('Username or password incorrect.'))
  })

  app.get('/', (request, reply) => reply.send({ info: 'Miscord v' + require('../../package.json').version }))
  app.register(handlers.connections, { prefix: '/connections' })
  app.register(handlers.config, { prefix: '/config' })

  app.listen(config.api.port || 8000, '0.0.0.0')
}
