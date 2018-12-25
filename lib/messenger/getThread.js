const log = logger.withScope('messenger:getThread')

module.exports = async (threadID, useCache = true) => {
  if (typeof threadID === 'string') threadID = Number(threadID)
  if (messenger.threads.has(threadID) && useCache) {
    log.debug('Messenger thread cached')
    return messenger.threads.get(threadID)
  } else {
    log.debug('Getting Messenger thread from API')
    const thread = await messenger.client.getThreadInfo(threadID)
    messenger.threads.set(threadID, thread)
    return thread
  }
}
