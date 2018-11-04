const log = logger.withScope('messenger:filter')

module.exports = (name, threadID) => {
  // handle whitelist
  const { whitelist } = config.messenger
  log.trace('whitelist', toStr(whitelist))
  if (whitelist.length > 0 && !(whitelist.includes(name) || whitelist.includes(threadID.toString()) || connections.has(threadID))) {
    log.debug(`Ignoring ${name} (${threadID}) due to the whitelist`)
    return false
  }
  return true
}
