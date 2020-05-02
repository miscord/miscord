import getThreadName from './getThreadName'
import MiscordThread from '../types/Thread'
import { Thread } from 'libfb'

const log = logger.withScope('messenger:getThread')

export default async function getThread (threadID: string, useCache = true): Promise<MiscordThread> {
  if (messenger.threads.has(threadID) && useCache) {
    log.debug('Messenger thread cached')

    const thread = messenger.threads.get(threadID)
    if (!thread) throw new Error(`Could not find thread ${threadID}`)

    return thread
  } else {
    log.debug('Getting Messenger thread from API')

    const thread = await messenger.client.getThreadInfo(threadID)
    if (!thread) throw new Error(`Could not find thread ${threadID}`)

    const miscordThread = await fillNames(thread)
    messenger.threads.set(threadID, miscordThread)

    return miscordThread
  }
}

export async function fillNames (thread: Thread): Promise<MiscordThread> {
  thread.name = await getThreadName(thread, false)
  ;(thread as MiscordThread).cleanName = await getThreadName(thread)
  return thread as MiscordThread
}
