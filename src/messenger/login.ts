import { Client, Thread, Session } from 'libfb'
import { fillNames } from './getThread'
import FakeClient from '../dummy/messenger'
import { reportError } from '../error'

const log = logger.withScope('messenger:login')

export default async () => {
  log.start('Logging in to Facebook...')
  await discord.client.user.setActivity('Logging in to Facebook...')
  await discord.client.user.setStatus('idle')
  let session: Session | undefined
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
  let client: Client | FakeClient = new FakeClient()
  if (config.messenger.username !== 'dummy') {
    await Promise.resolve()
      .then(() => {
        client = new Client({ session })
        return client.login(config.messenger.username, config.messenger.password)
      })
      .catch(() => {
        if (session && session.deviceId) {
          client = new Client({ deviceId: session.deviceId })
        } else {
          client = new Client()
        }
        return client.login(config.messenger.username, config.messenger.password)
      })
      .catch(async err => {
        if (!config.messenger.accounts.length) throw err
        for (let account of config.messenger.accounts) {
          try {
            client = new Client()
            await client.login(account.username, account.password)
          } catch (err) {
            log.warn('Could not log into Facebook')
            reportError(err)
            client = new FakeClient()
          }
        }
      })
      .catch(err => {
        client = new FakeClient()
        log.warn('Could not log into Facebook')
        return reportError(err)
      })
  }

  if (client instanceof FakeClient && discord.channels.error && discord.channels.error.length) {
    for (let channel of discord.channels.error) {
      channel.send(`Hey! It looks like your instance could not log into Facebook.
You can now change the account credentials through a command channel or dashboard, if you have them enabled`)
    }
    await discord.client.user.setStatus('dnd')
  } else {
    await discord.client.user.setStatus('online')
  }

  global.messenger = {
    client,
    threads: new Map(),
    senders: new Map()
  }
  let threads = await client.getThreadList(50) // because why not? shouldn't cause lags even on Raspberry Pi
  /*
  2018/12/25 update: Facebook API can be a bit slow when requesting a lot of threads;
                     processing speeds peak at 10ms
  2019/08/24 update: Downloading a lot of stuff and keeping it in memory isn't the best strategy.
  */
  threads = threads
    .map((thread: Thread) => {
      if (!thread.nicknames) return thread
      const nicknames: Map<number, string> = new Map()
      thread.nicknames.forEach((el: { participant_id: string, nickname: string }) => {
        nicknames.set(Number(el.participant_id), el.nickname)
      })
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

  if (client instanceof Client) {
    await config.saveSession(client.getSession())
    log.success('Logged in to Facebook')
  }
}
