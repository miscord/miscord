const log = logger.withScope('messenger:getThread')
const getThreadName = require('./getThreadName')

module.exports = async (threadID, useCache = true) => {
  if (typeof threadID === 'string') threadID = Number(threadID)
  if (messenger.threads.has(threadID) && useCache) {
    log.debug('Messenger thread cached')
    let thread = messenger.threads.get(threadID)
    if (!thread.cleanName) await fillNames(thread)
    return thread
  } else {
    log.debug('Getting Messenger thread from API')
    const thread = await messenger.client.getThreadInfo(threadID)
    await fillNames(thread)
    messenger.threads.set(threadID, thread)
    return thread
  }
}

async function fillNames (thread) {
  thread.name = await getThreadName(thread, false)
  thread.cleanName = await getThreadName(thread)
}
