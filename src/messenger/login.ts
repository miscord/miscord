import { Client, Thread } from 'libfb'
import { fillNames } from './getThread'

const log = logger.withScope('messenger:login')

export default async () => {
  log.start('Logging in to Facebook...')
  let session
  try {
    session = await config.loadSession()
    if (session && session.tokens && session.tokens.identifier) {
      if (session.tokens.identifier !== config.messenger.username) {
        // invalidate session if the username changed
        // currently no way to check if password changed other than keeping it in a file
        session = undefined
      }
    }
  } catch (err) {
    session = undefined
  }
  let client
  try {
    client = new Client({ session })
    await client.login(config.messenger.username, config.messenger.password)
  } catch (err) {
    client = new Client()
    await client.login(config.messenger.username, config.messenger.password)
  }
  global.messenger = {
    client,
    threads: new Map(),
    senders: new Map()
  }
  let threads = await client.getThreadList(200) // because why not? shouldn't cause lags even on Raspberry Pi
  /*
  2018/12/25 update: Facebook API can be a bit slow when requesting a lot of threads;
                     processing speeds peak at 10ms
  */
  threads = threads
    .map((thread: Thread) => {
      if (!thread.nicknames) return thread
      const nicknames: { [userID: number]: string } = {}
      thread.nicknames.forEach((el: { participant_id: string, nickname: string }) => { nicknames[Number(el.participant_id)] = el.nickname })
      thread.nicknames = nicknames
      return thread
    })

  for (let thread of threads) {
    thread.participants.forEach(user => messenger.senders.set(user.id, user))
    const miscordThread = await fillNames(thread)
    messenger.threads.set(thread.id, miscordThread)
  }

  log.trace('threads', Array.from(messenger.threads, ([ id, thread ]) => ({ id, name: thread.name })))
  log.trace('senders', Array.from(messenger.senders, ([ id, sender ]) => ({ id, name: sender.name })))
  await config.saveSession(client.getSession())
  log.success('Logged in to Facebook')
}
