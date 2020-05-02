import ConnectionsManager from './ConnectionsManager'
import updateNotifier from './updateNotifier'

import { login as messengerLogin } from './messenger'
import { fetchWebhooks, login as discordLogin } from './discord'

const log = logger.withScope('login')

export default async function login (): Promise<void> {
  const { version } = require('../package.json') as { version: string }

  logger.start('Launching Miscord v' + version)
  log.start('Logging in...')
  log.trace('config', config)
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
