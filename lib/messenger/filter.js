const log = require('npmlog')

module.exports = (name, threadID) => {
  // handle whitelist
  const { whitelist } = config.messenger
  log.silly('filter: whitelist', whitelist)
  if (whitelist.length > 0 && !(whitelist.includes(name) || whitelist.includes(threadID.toString()) || connections.has(threadID))) {
    log.verbose('filter', 'Ignoring', name, `(${threadID})`, 'due to the whitelist')
    return false
  }
  return true
}
