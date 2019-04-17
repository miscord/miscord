const log = logger.withScope('api:auth')
const auth = require('basic-auth')

module.exports = app => {
  app.addHook('preHandler', (request, reply, next) => {
    if (!request.headers.authorization) {
      reply.code(401).header('WWW-Authenticate', 'Basic realm="Miscord API"').send()
      return
    }
    const { name, pass } = auth.parse(request.headers.authorization)
    log.debug('api login', { name, pass })
    if (name === config.api.username && pass === config.api.password) return next()
    reply.code(403).send('Username or password incorrect.')
  })
}
