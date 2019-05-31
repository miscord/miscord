const log = logger.withScope('messenger:handleMentions')

import Thread from '../types/Thread'
import { Mention } from 'libfb'

export default function handleMentions (message: string, thread: Thread): Mention[] {
  const mentions: Mention[] = []
  for (let user of thread.participants) {
    const offset = message.toLowerCase().indexOf(user.name.toLowerCase())
    if (offset === -1) continue
    mentions.push({ offset, length: user.name.length, id: user.id })
  }
  log.trace('mentions', mentions)
  return mentions
}
