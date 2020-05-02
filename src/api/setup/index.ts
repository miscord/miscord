/* eslint-disable @typescript-eslint/require-await */
import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import EventEmitter from 'events'
import { Client as DiscordClient } from 'discord.js'
import { Client as MessengerClient, Session } from 'libfb'
import path from 'path'

const log = logger.withScope('setup-api')

export default class SetupServer extends EventEmitter {
  app: fastify.FastifyInstance = fastify()
  messengerSession: Session = { tokens: null, deviceId: null }

  run (): void {
    this.app.register(fastifyStatic, {
      root: path.join(__dirname, '..', '..', '..', 'node_modules'),
      prefix: '/node_modules/',
      decorateReply: false
    })

    this.app.register(fastifyStatic, {
      root: path.join(__dirname, '..', '..', '..', 'static'),
      prefix: '/static/'
    })

    this.app.get('/', (request, reply) => {
      reply.sendFile('setup/index.html')
    })

    this.app.post('/validate/discord', async (request, reply) => {
      const client = new DiscordClient()
      try {
        await client.login(request.body.token)
        return { valid: true, username: `${client.user.username}#${client.user.discriminator}` }
      } catch (err) {
        return { valid: false, error: err.message }
      }
    })

    this.app.post('/validate/messenger', async (request, reply) => {
      const client = new MessengerClient()
      try {
        await client.login(request.body.username, request.body.password)
        const userID = client.getSession().tokens?.uid ?? '0'
        const user = await client.getUserInfo(userID)
        this.messengerSession = client.getSession()
        return { valid: true, username: user.name }
      } catch (err) {
        return { valid: false, error: err.message }
      }
    })

    this.app.post('/config', async (request, reply) => {
      this.emit('config', request.body)
      return {}
    })

    this.app.listen(9448, '0.0.0.0')
      .then(() => {
        log.success('API is listening on port 9448')
        log.info('Go to http://localhost:9448/ for setup')
      })
      .catch(err => log.error(err))
  }

  async stop (): Promise<void> {
    return this.app.close()
  }
}
