// https://stackoverflow.com/questions/5072136/javascript-filter-for-objects
Object.from = arr => Object.assign(...arr.map(([k, v]) => ({ [k]: v })))
Object.filter = (obj, predicate) => Object.from(Object.entries(obj).filter(predicate))
Object.map = (obj, mapper) => Object.from(Object.entries(obj).map(mapper))

const fs = require('fs')
const log = logger.withScope('saveConfig')
const { defaultConfig } = require('../config/getConfig')

module.exports = () => {
  const configPath = require('path').join(config.path, 'config.json')
  let copiedConfig = JSON.parse(JSON.stringify(config))
  let newConfig = Object.map(copiedConfig, ([ key, value ]) => {
    if (typeof value === 'object' && defaultConfig[key]) return [ key, diff(defaultConfig[key], value) ]
    return [ key, value ]
  })
  delete newConfig.path
  fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), saveErrorHandler)
}

function diff (o1, o2) {
  return Object.keys(o2).reduce((diff, key) => {
    log.trace('diff key', key)
    if (JSON.stringify(o1[key]) === JSON.stringify(o2[key])) return diff
    return {
      ...diff,
      [key]: o2[key]
    }
  }, {})
}

function saveErrorHandler (err) {
  if (!err) return
  log.error('Error occured while saving config')
  log.error(err)
}
