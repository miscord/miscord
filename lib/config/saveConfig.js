// https://stackoverflow.com/questions/5072136/javascript-filter-for-objects
Object.from = arr => Object.assign(...arr.map(([k, v]) => ({[k]: v})))
Object.filter = (obj, predicate) => Object.from(Object.entries(obj).filter(predicate))
Object.map = (obj, mapper) => Object.from(Object.entries(obj).map(mapper))

const fs = require('fs')
const log = logger.withScope('saveConfig')

module.exports = () => {
  const configPath = require('path').join(config.path, 'config.json')
  fs.writeFile(configPath, JSON.stringify(config, null, 2), saveErrorHandler)
}

function saveErrorHandler (err) {
  if (!err) return
  log.error('Error occured while saving config')
  log.error(err)
}
