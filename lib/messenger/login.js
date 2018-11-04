const { login } = require('libfb')
const log = logger.withScope('messenger:login')
const fs = require('fs')
const path = require('path')

module.exports = async () => {
  log.info('Logging in to Facebook...')
  let session
  try {
    session = require(path.join(config.path, 'session.json'))
  } catch (err) {
    session = null
  }
  const api = await login(config.messenger.username, config.messenger.password, { session })
  global.messenger = { client: api }
  messenger.threads = new Map()
  messenger.senders = new Map()
  const threads = await api.getThreadList(1000) // because why not? shouldn't cause lags event on Raspberry Pi
  threads
    .map(thread => {
      if (!thread.nicknames) return thread
      const nicknames = {}
      thread.nicknames.forEach(el => { nicknames[Number(el.participant_id)] = el.nickname })
      thread.nicknames = nicknames
      return thread
    })
    .forEach(thread => {
      messenger.threads.set(thread.id, thread)
      thread.participants.forEach(user => {
        user.id = Number(user.id)
        messenger.senders.set(user.id, user)
      })
    })
  log.trace('threads', messenger.threads)
  log.trace('senders', messenger.senders)
  fs.writeFileSync(path.join(config.path, 'session.json'), JSON.stringify(api.getSession()))
  log.success('Logged in to Facebook')
}
