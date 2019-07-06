import fastify from 'fastify'
import auth from 'basic-auth'
import fastifyStatic from 'fastify-static'
import path from 'path'

import connectionsHandler from './connections'
import configHandler from './config'
import controlHandler from './control'
import discordHandler from './discord'
import messengerHandler from './messenger'
import { Reply } from '../types/fastify'

const log = logger.withScope('api')

export default function runServer () {
  const app = fastify()

  app.register(fastifyStatic, {
    root: path.join(__dirname, '..', '..', 'node_modules'),
    prefix: '/node_modules/',
    decorateReply: false
  })

  app.register(fastifyStatic, {
    root: path.join(__dirname, '..', '..', 'static'),
    prefix: '/static/'
  })

  app.decorateReply('sendError', function (this: Reply, code: number, message: string) {
    this.code(code).send(new Error(message))
  })

  if (config.api.key) {
    app.addHook('preHandler', (request, reply, next) => {
      const { authorization } = request.headers

      if (!authorization) return reply.sendError(403, 'API key missing')
      if (!authorization.startsWith('Bearer ')) return reply.sendError(403, 'API key incorrect')

      const key = authorization.split(' ')[1]
      if (key !== config.api.key) return reply.sendError(403, 'API key incorrect')

      next()
    })
  } else {
    app.addHook('preHandler', (request, reply, next) => {
      const send401 = () => reply
        .code(401)
        .header('WWW-Authenticate', 'Basic realm="Miscord API"')
        .header('Content-Type', 'text/html')
        .send('<h1>Forbidden</h1>')

      if (!request.headers.authorization) return send401()

      const creds = auth.parse(request.headers.authorization)
      if (!creds) return send401()

      const { name, pass } = creds
      log.debug('login', { name, pass })
      if (name === config.api.username && pass === config.api.password) return next()

      send401()
    })
  }

  app.get('/', (request, reply) => {
    reply.sendFile('dashboard/index.html')
  })
  app.get('/config-discord/', (request, reply) => {
    reply.sendFile('dashboard/config-discord.html')
  })
  app.get('/config-messenger/', (request, reply) => {
    reply.sendFile('dashboard/config-messenger.html')
  })
  app.get('/config-miscellaneous/', (request, reply) => {
    reply.sendFile('dashboard/config-miscellaneous.html')
  })
  app.get('/connections/', (request, reply) => {
    reply.sendFile('dashboard/connections.html')
  })
  app.register(connectionsHandler, { prefix: '/connections' })
  app.register(configHandler, { prefix: '/config' })
  app.register(controlHandler, { prefix: '/control' })
  app.register(discordHandler, { prefix: '/discord' })
  app.register(messengerHandler, { prefix: '/messenger' })

  app.listen(config.api.port || 9448, '0.0.0.0').then(() => log.success(`API is listening on port ${config.api.port || 9448}`))
  return app
}
