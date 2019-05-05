const log = logger.withScope('login')

const ConnectionsManager = require('./ConnectionsManager')
const updateNotifier = require('./updateNotifier')

const { login: messengerLogin } = require('./messenger')
const { login: discordLogin, fetchWebhooks } = require('./discord')

export default async () => {
  logger.start('Launching Miscord v' + require('../package.json').version)
  log.start('Logging in...')
  log.trace('Config.ts.ts', config)
  log.info('logLevel', config.logLevel)

  // check for updates if enabled in the config
  if (config.checkUpdates) await updateNotifier()
  global.connections = new ConnectionsManager()
  return discordLogin()
    .then(messengerLogin)
    .then(() => connections.load())
    .then(fetchWebhooks)
    .then(() => log.success('Logged in'))
}
