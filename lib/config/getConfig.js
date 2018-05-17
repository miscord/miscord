const getEnvConfig = require('./getEnvConfig')
const getConfigDir = require('./getConfigDir')
const log = require('npmlog')
const path = require('path')
const util = require('util')
const fs = require('fs')

module.exports = async configPath => {
  var config = await getConfig(configPath)

  if (config.boldUsername !== undefined || config.showUsername !== undefined) log.warn('getConfig', '"boldUsername" and "showUsername" are deprecated. Use "format" instead')

  // if any of the optional values is undefined, return default value
  var defaultConfig = {
    messenger: {
      forceLogin: false,
      filter: {
        whitelist: [],
        blacklist: []
      },
      format: '*{username}*: {message}',
      sourceFormat: {
        discord: '(Discord)',
        messenger: '(Messenger: {name})'
      },
      link: {},
      ignoreEmbeds: false
    },
    discord: {
      renameChannels: true,
      showEvents: false,
      showFullNames: false
    },
    checkUpdates: true,
    logLevel: process.env.MISCORD_LOG_LEVEL || 'info',
    custom: {},
    path: getConfigDir(configPath)
  }
  return mergeDeep(defaultConfig, config)
}

function getConfig (configPath) {
  return new Promise(async (resolve, reject) => {
    var configFile = path.join(getConfigDir(configPath), 'config.json')
    try {
      var data = await util.promisify(fs.readFile)(configFile, 'utf8')
      var config = JSON.parse(data)

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

// https://stackoverflow.com/a/48218209/
function mergeDeep (...objects) {
  const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj)
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      if (!obj[key] && prev[key] && typeof obj[key] !== 'boolean' && typeof prev[key] !== 'boolean') return
      prev[key] = isObject(prev[key]) && isObject(obj[key]) ? mergeDeep(prev[key], obj[key]) : obj[key]
    })
    return prev
  }, {})
}
