const log = require('npmlog')
const { promisify } = require('util')

module.exports = async (threadID, useCache = true) => {
  if (messenger.threads.has(threadID) && useCache) {
    log.verbose('getThread', 'Messenger thread cached')
    return messenger.threads.get(threadID)
  } else {
    log.verbose('getThread', 'Getting Messenger thread from API')
    var thread = await promisify(messenger.client.getThreadInfo)(threadID)
    messenger.threads.set(threadID, thread)
    return thread
  }
}
