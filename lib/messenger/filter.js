const log = require('npmlog')

module.exports = (config, name, message) => {
  // handle white/blacklist
  var { whitelist, blacklist } = config.messenger.filter
  log.silly('filter: whitelist', whitelist)
  log.silly('filter: blacklist', blacklist)
  if (whitelist.length > 0 && !(whitelist.includes(name) || whitelist.includes(message.threadID.toString()))) {
    log.verbose('filter', 'Ignoring', name, `(${message.threadID})`, 'due to the whitelist')
    return false
  }
  if (blacklist.length > 0 && (blacklist.includes(name) || blacklist.includes(message.threadID.toString()))) {
    log.verbose('filter', 'Ignoring', name, `(${message.threadID})`, 'due to the blacklist')
    return false
  }
  return true
}
