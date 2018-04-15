const getEnvConfig = require('./getEnvConfig')
const getConfigDir = require('./getConfigDir')
const log = require('npmlog')
const path = require('path')
const util = require('util')
const fs = require('fs')
const getKey = (e, d) => e === undefined ? d : e

module.exports = async configPath => {
  var config = await getConfig(configPath)

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
      },
      separateImages: getKey(config.messenger.separateImages, false)
    },
    discord: {
      token: config.discord.token,
      guild: config.discord.guild,
      category: config.discord.category || 'messenger',
      renameChannels: getKey(config.discord.renameChannels, true),
      showEvents: getKey(config.discord.showEvents, false),
      showFullNames: getKey(config.discord.showFullNames, true)
    },
    checkUpdates: getKey(config.checkUpdates, true),
    logLevel: process.env.MISCORD_LOG_LEVEL || config.logLevel || 'info',
    custom: config.custom || {},
    path: getConfigDir(configPath)
  }
}

function getConfig (configPath) {
  return new Promise(async (resolve, reject) => {
    var configFile = path.join(getConfigDir(configPath), 'config.json')
    try {
      var data = await util.promisify(fs.readFile)(configFile, 'utf8')
      var config = JSON.parse(data)

      if (config.facebook) {
        log.warn('config.facebook.* is deprecated. Use config.messenger.* instead.')
        config.messenger = config.facebook
      }
      if (!config.discord.token || !config.messenger.username || !config.messenger.password) {
        log.warn('getConfig', 'Token/username/password not found, getting env config')
        resolve(getEnvConfig())
      }
      resolve(config)
    } catch (err) {
      if (err.code && err.code === 'ENOENT') {
        try {
          log.warn('getConfig', (configFile + ' not found, creating example config'))
          var example = path.join(__dirname, '../../config.example.json')
          // https://github.com/zeit/pkg/issues/342#issuecomment-368303496
          if (process.pkg) {
            fs.writeFileSync(configFile, fs.readFileSync(example))
          } else {
            fs.copyFileSync(example, configFile)
          }
        } catch (error) {
          log.warn('getConfig', error)
        }
        resolve(getEnvConfig())
      } else {
        log.warn('getConfig', 'Something went wrong:', err)
        resolve(getEnvConfig())
      }
    }
  })
}
