const getEnvConfig = require('./getEnvConfig.js')
const log = require('npmlog')
const path = require('path')
const os = require('os')
const getKey = (e, d) => e === undefined ? d : e
const getConfigPath = () => {
  if (process.env.NODE_ENV === 'development') return '../../config.json'
  switch (process.platform) {
    case 'win32':
      return path.join(process.env.APPDATA, 'Miscord', 'config.json')
      break
    case 'darwin':
    case 'linux':
      return path.join(os.homedir(), '.config', 'Miscord', 'config.json')
      break
    default:
      return path.join(os.homedir(), '.miscord.json')
  }
}

module.exports = path => {
  var config
  try {
    config = require(path || getConfigPath())
    if (config.facebook) {
      log.warn('config.facebook.* is deprecated. Use config.messenger.* instead.')
      config.messenger = config.facebook
    }
    if (!config.discord.token || !config.messenger.username || !config.messenger.password) {
      log.warn('getConfig', 'Token/username/password not found, getting env config')
      config = getEnvConfig()
    }
  } catch (err) {
    log.warn('getConfig', 'Something went wrong:')
    log.warn(err)
    config = getEnvConfig()
  }

  // if any of the optional values is undefined, return default value
  return {
    messenger: {
      username: config.messenger.username,
      password: config.messenger.password,
      forceLogin: getKey(config.messenger.forceLogin, false),
      showUsername: getKey(config.messenger.showUsername, true),
      boldUsername: getKey(config.messenger.boldUsername, false),
      filter: {
        whitelist: config.messenger.filter.whitelist || [],
        blacklist: config.messenger.filter.blacklist || []
      }
    },
    discord: {
      token: config.discord.token,
      guild: config.discord.guild,
      category: config.discord.category || 'messenger',
      sendNotifications: getKey(config.discord.sendNotifications, true),
      noEmbeds: getKey(config.discord.noEmbeds, false),
      renameChannels: getKey(config.discord.renameChannels, true)
    },
    checkUpdates: getKey(config.checkUpdates, true),
    logLevel: config.logLevel || process.env.MISCORD_LOG_LEVEL || 'info',
    custom: config.custom || {}
  }
}
