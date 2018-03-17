const log = require('npmlog')

const getConfig = require('../config/getConfig.js')
const updateNotifier = require('../updateNotifier.js')

const getFacebook = require('./messenger.js')
const getDiscord = require('./discord.js')

module.exports = async () => {
  log.info('login', 'Logging in...')
  var config = getConfig()

  log.info('login', 'Log level: %s', config.logLevel)
  log.level = config.logLevel

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
