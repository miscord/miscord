const log = require('npmlog')

module.exports = (name, threadID) => {
  // handle white/blacklist
  var { whitelist, blacklist } = config.messenger.filter
  log.silly('filter: whitelist', whitelist)
  log.silly('filter: blacklist', blacklist)
  if (whitelist.length > 0 && !(whitelist.includes(name) || whitelist.includes(threadID.toString()) || connections.has(threadID))) {
    log.verbose('filter', 'Ignoring', name, `(${threadID})`, 'due to the whitelist')
    return false
  }
  if (blacklist.length > 0 && (blacklist.includes(name) || blacklist.includes(threadID.toString()))) {
    log.verbose('filter', 'Ignoring', name, `(${threadID})`, 'due to the blacklist')
    return false
  }
  return true
}
