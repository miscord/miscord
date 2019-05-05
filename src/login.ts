const log = logger.withScope('login')

import ConnectionsManager from './ConnectionsManager'
import updateNotifier from './updateNotifier'

import { login as messengerLogin } from './messenger'
import { fetchWebhooks, login as discordLogin } from './discord'

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
