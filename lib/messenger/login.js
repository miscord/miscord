const { login } = require('libfb')
const log = logger.withScope('messenger:login')
const fs = require('fs')
const path = require('path')

module.exports = async () => {
  log.start('Logging in to Facebook...')
  let session
  try {
    session = require(path.join(config.path, 'session.json'))
    if (session && session.tokens && session.tokens.identifier) {
      if (session.tokens.identifier !== config.messenger.username) {
        // invalidate session if the username changed
        // currently no way to check if password changed other than keeping it in a file
        fs.unlinkSync(path.join(config.path, 'session.json'))
        session = null
      }
    }
  } catch (err) {
    session = null
  }
  let api
  try {
    api = await login(config.messenger.username, config.messenger.password, { session })
  } catch (err) {
    api = await login(config.messenger.username, config.messenger.password)
  }
  global.messenger = { client: api }
  messenger.threads = new Map()
  messenger.senders = new Map()
  const threads = await api.getThreadList(1000) // because why not? shouldn't cause lags even on Raspberry Pi
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
  log.trace('threads', Array.from(messenger.threads, ([id, thread]) => ({ id, name: thread.name })))
  log.trace('senders', Array.from(messenger.senders, ([id, sender]) => ({ id, name: sender.name })))
  fs.writeFileSync(path.join(config.path, 'session.json'), JSON.stringify(api.getSession()))
  log.success('Logged in to Facebook')
}
