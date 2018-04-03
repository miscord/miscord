const log = require('npmlog')
const { promisify } = require('util')

module.exports = async (config, threadID) => {
  if (config.messenger.threads.has(threadID)) {
    log.verbose('getThread', 'Messenger thread cached')
    return config.messenger.threads.get(threadID)
  } else {
    log.verbose('getThread', 'Getting Messenger thread from API')
    var thread = await promisify(config.messenger.client.getThreadInfo)(threadID)
    config.messenger.threads.set(threadID, thread)
    return thread
  }
}
