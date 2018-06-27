// https://stackoverflow.com/questions/5072136/javascript-filter-for-objects
Object.from = arr => Object.assign(...arr.map(([k, v]) => ({[k]: v})))
Object.filter = (obj, predicate) => Object.from(Object.entries(obj).filter(predicate))
Object.map = (obj, mapper) => Object.from(Object.entries(obj).map(mapper))

const fs = require('fs')
const log = require('npmlog')
const dotProp = require('dot-prop')

const defaultConfig = {
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
    showFullNames: false,
    createChannels: true,
    massMentions: true
  },
  checkUpdates: true,
  logLevel: process.env.MISCORD_LOG_LEVEL || 'info',
  custom: {}
}

const forbiddenValues = [
  'client',
  'channels',
  'stopListening',
  'guild',
  'webhooks',
  'senders',
  'threads',
  'path'
]

module.exports = () => {
  const configPath = require('path').join(config.path, 'config.beta.json')
  const safeConfig = Object.map(config, makeSureItsSafeToWrite)
  fs.writeFile(configPath, JSON.stringify(safeConfig, null, 2), saveErrorHandler)
}

function makeSureItsSafeToWrite ([key, value], origKey) {
  log.silly('saveConfig: key', key)
  log.silly('saveConfig: value', value)

  const fullKey = typeof origKey === 'string' && !origKey.match(/^[0-9]*$/) ? origKey + '.' + key : key
  log.silly('saveConfig: fullKey', fullKey)

  const defaultValue = dotProp.get(defaultConfig, fullKey)
  log.silly('saveConfig: defaultValue', defaultValue)

  if (['errorChannel', 'commandChannel', 'category'].includes(key) && value.id) return [key, value.id]

  if (value === defaultValue || forbiddenValues.includes(key) || (key !== 'discord' && JSON.stringify(value) === JSON.stringify(defaultValue))) {
    return [key, undefined]
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const newValue = Object.map(value, prop => makeSureItsSafeToWrite(prop, fullKey))
    return [key, newValue]
  }
  return (['boolean', 'string', 'number'].includes(typeof value) || Array.isArray(value)) ? [key, value] : [key, undefined]
}

function saveErrorHandler (err) {
  if (!err) return
  log.error('saveConfig', 'Error occured while saving config')
  log.error('saveConfig', err)
}
