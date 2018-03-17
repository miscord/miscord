const getEnvConfig = require('./getEnvConfig.js')
const log = require('npmlog')
const getKey = (e, d) => e === undefined ? d : e

module.exports = () => {
  var config
  try {
    config = require('../../config.json')
    if (!config.discord.token || !config.facebook.username || !config.facebook.password) {
      log.warn('getConfig', 'Token/username/password not found, getting env config')
      config = getEnvConfig()
    }
  } catch (err) {
    log.warn('getConfig', 'Something went wrong:')
    log.warn(err)
    config = getEnvConfig()
  }

  if (config.discord.showUsername) log.error('getConfig', 'config.discord.showUsername is deprecated. Use config.facebook.showUsername instead.')

  // if any of the optional values is undefined, return default value
  return {
    facebook: {
      username: config.facebook.username,
      password: config.facebook.password,
      forceLogin: getKey(config.facebook.forceLogin, false),
      showUsername: getKey(config.facebook.showUsername, true),
      boldUsername: getKey(config.facebook.boldUsername, false),
      filter: {
        whitelist: config.facebook.filter.whitelist || [],
        blacklist: config.facebook.filter.blacklist || []
      }
    },
    discord: {
      token: config.discord.token,
      guild: config.discord.guild,
      category: config.discord.category || 'messenger',
      sendNotifications: getKey(config.discord.sendNotifications, true)
    },
    checkUpdates: getKey(config.checkUpdates, true),
    logLevel: config.logLevel || process.env.MISCORD_LOG_LEVEL || 'info'
  }
}
