const log = require('npmlog')
const updateNotifier = require('./updateNotifier')

const { login: messengerLogin } = require('./messenger')
const { login: discordLogin } = require('./discord')

module.exports = async () => {
  log.level = config.logLevel
  log.info('login', 'Launching Miscord v' + require('../package.json').version)
  log.info('login', 'Logging in...')
  log.silly('login: config', config)
  log.info('login', 'Log level:', config.logLevel)

  // check for updates if enabled in the config
  if (config.checkUpdates) await updateNotifier()
  return discordLogin().then(messengerLogin).then(_ => log.info('login', 'Logged in'))
}
