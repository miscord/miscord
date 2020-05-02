import fastify, { FastifyInstance } from 'fastify'
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

export default function runServer (): FastifyInstance {
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

      if (!authorization) {
        reply.sendError(403, 'API key missing')
        return
      }
      if (!authorization.startsWith('Bearer ')) {
        reply.sendError(403, 'API key incorrect')
        return
      }

      const key = authorization.split(' ')[1]
      if (key !== config.api.key) {
        reply.sendError(403, 'API key incorrect')
        return
      }

      next()
    })
  } else {
    app.addHook('preHandler', (request, reply, next) => {
      const send401 = (): Reply => reply
        .code(401)
        .header('WWW-Authenticate', 'Basic realm="Miscord API"')
        .header('Content-Type', 'text/html')
        .send('<h1>Forbidden</h1>')

      if (!request.headers.authorization) {
        send401()
        return
      }

      const creds = auth.parse(request.headers.authorization)
      if (!creds) {
        send401()
        return
      }

      const { name, pass } = creds
      log.debug('login', { name, pass })
      if (name === config.api.username && pass === config.api.password) return next()

      send401()
    })
  }

  app.get('/', (request, reply) => {
    reply.sendFile('dashboard/index.html')
  })
  app.get('/config/discord/', (request, reply) => {
    reply.sendFile('dashboard/config-discord.html')
  })
  app.get('/config/messenger/', (request, reply) => {
    reply.sendFile('dashboard/config-messenger.html')
  })
  app.get('/config/miscellaneous/', (request, reply) => {
    reply.sendFile('dashboard/config-miscellaneous.html')
  })
  app.get('/connections/', (request, reply) => {
    reply.sendFile('dashboard/connections.html')
  })
  app.register(connectionsHandler, { prefix: '/api/connections' })
  app.register(configHandler, { prefix: '/api/config' })
  app.register(controlHandler, { prefix: '/api/control' })
  app.register(discordHandler, { prefix: '/api/discord' })
  app.register(messengerHandler, { prefix: '/api/messenger' })

  const port = Number(config.api.port ?? 9448)

  app.listen(port, '0.0.0.0')
    .then(() => log.success(`API is listening on port ${port}`))
    .catch(err => {
      if (err.code === 'EADDRINUSE') {
        app.listen(port + 1, '0.0.0.0')
          .then(() => log.success(`API is listening on port ${port + 1}`))
          .catch(err => log.error(err))
      } else {
        throw err
      }
    })
  return app
}
