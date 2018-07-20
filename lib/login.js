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
  return discordLogin().then(discord => {
    config.discord.client = discord
    return messengerLogin()
  }).then(messenger => {
    log.info('login', 'Logged in')
    config.messenger.client = messenger
  })
}
