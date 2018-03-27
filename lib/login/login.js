const log = require('npmlog')

const getConfig = require('../config/getConfig.js')
const updateNotifier = require('../updateNotifier.js')

const getFacebook = require('./messenger.js')
const getDiscord = require('./discord.js')

module.exports = async () => {
  log.info('login', 'Launching Miscord v' + require('../../package.json').version)
  log.info('login', 'Logging in...')
  var config = getConfig()
  log.level = config.logLevel
  log.silly('login: config', config)
  log.info('login', 'Log level:', config.logLevel)

  // check for updates if enabled in the config
  if (config.checkUpdates) await updateNotifier()
  return getDiscord(config).then(discord => {
    config.discord.client = discord
    return getFacebook(config)
  }).then(facebook => {
    log.info('login', 'Logged in')
    config.facebook.client = facebook
    return config
  })
}
