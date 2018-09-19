const log = logger.withScope('messenger:getThread')
const { promisify } = require('util')

module.exports = async (threadID, useCache = true) => {
  if (messenger.threads.has(threadID) && useCache) {
    log.debug('Messenger thread cached')
    return messenger.threads.get(threadID)
  } else {
    log.debug('Getting Messenger thread from API')
    const thread = await promisify(messenger.client.getThreadInfo)(threadID)
    messenger.threads.set(threadID, thread)
    return thread
  }
}
