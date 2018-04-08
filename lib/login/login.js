const log = require('npmlog')
const updateNotifier = require('../updateNotifier')

const getMessenger = require('./messenger')
const getDiscord = require('./discord')

module.exports = async config => {
  log.level = config.logLevel
  log.info('login', 'Launching Miscord v' + require('../../package.json').version)
  log.info('login', 'Logging in...')
  log.silly('login: config', config)
  log.info('login', 'Log level:', config.logLevel)

  // check for updates if enabled in the config
  if (config.checkUpdates) await updateNotifier()
  return getDiscord(config).then(discord => {
    config.discord.client = discord
    return getMessenger(config)
  }).then(messenger => {
    log.info('login', 'Logged in')
    config.messenger.client = messenger
    return config
  })
}
