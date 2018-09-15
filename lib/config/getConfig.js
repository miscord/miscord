const getConfigDir = require('./getConfigDir')
const log = require('npmlog')
const path = require('path')
const util = require('util')
const fs = require('fs')

const defaultConfig = {
  messenger: {
    forceLogin: true,
    whitelist: [],
    format: '*{username}*: {message}',
    sourceFormat: {
      discord: '(Discord)',
      messenger: '(Messenger: {name})'
    },
    ignoreEmbeds: false
  },
  discord: {
    renameChannels: true,
    showEvents: false,
    showFullNames: false,
    createChannels: false,
    massMentions: true
  },
  checkUpdates: false,
  logLevel: process.env.MISCORD_LOG_LEVEL || 'info',
  consoleTimestamps: false,
  logsTimestamps: true
}

module.exports = async configPath => {
  var config = await getConfig(configPath)
  config.path = getConfigDir(configPath)
  config.logLevel = process.env.MISCORD_LOG_LEVEL || config.logLevel
  // if any of the optional values is undefined, return default value
  global.config = mergeDeep(defaultConfig, config)
}

module.exports.defaultConfig = defaultConfig

function getConfig (configPath) {
  return new Promise(async (resolve, reject) => {
    var configFile = path.join(getConfigDir(configPath), path.parse(configPath || 'config.json').base)
    log.info('getConfig', 'Using config at', configFile)
    try {
      var data = await util.promisify(fs.readFile)(configFile, 'utf8')
      var config = JSON.parse(data)

      if (!config.discord.token || !config.messenger.username || !config.messenger.password) {
        throw new Error('Token/username/password not found.')
      }
      resolve(config)
    } catch (err) {
      if (!err.code || err.code !== 'ENOENT') throw err
      log.warn('getConfig', (configFile + ' not found, creating example config'))
      var example = path.join(__dirname, '../../config.example.json')
      // https://github.com/zeit/pkg/issues/342#issuecomment-368303496
      if (process.pkg) {
        fs.writeFileSync(configFile, fs.readFileSync(example))
      } else {
        fs.copyFileSync(example, configFile)
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
