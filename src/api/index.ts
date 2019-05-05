import fastify from 'fastify'
import auth from 'basic-auth'

import connectionsHandler from './connections'
import configHandler from './config'

const log = logger.withScope('api')

export default () => {
  const app = fastify()

  if (config.api.key) {
    app.addHook('preHandler', (request, reply, next) => {
      const { authorization } = request.headers

      if (!authorization) return reply.code(403).send(new Error('API key missing'))
      if (!authorization.startsWith('Bearer ')) return reply.code(403).send(new Error('API key incorrect'))

      const key = authorization.split(' ')[1]
      if (key !== config.api.key) return reply.code(403).send(new Error('API key incorrect'))

      next()
    })
  } else {
    app.addHook('preHandler', (request, reply, next) => {
      if (!request.headers.authorization) {
        reply.code(401).header('WWW-Authenticate', 'Basic realm="Miscord API"').send()
        return
      }
      const { name, pass } = auth.parse(request.headers.authorization)!!
      log.debug('login', { name, pass })
      if (name === config.api.username && pass === config.api.password) return next()
      reply.code(403).send(new Error('Username or password incorrect.'))
    })
  }

  app.get('/', (request, reply) => {
    reply.send({ info: 'Miscord v' + require('../../package.json').version })
  })
  app.register(connectionsHandler, { prefix: '/connections' })
  app.register(configHandler, { prefix: '/config' })

  app.listen(config.api.port || 8000, '0.0.0.0').then(() => log.success(`API is listening on port ${config.api.port || 8000}`))
}
