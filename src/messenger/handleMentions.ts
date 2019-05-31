const log = logger.withScope('messenger:handleMentions')

import Thread from '../types/Thread'
import { Mention } from 'libfb'

export default function handleMentions (message: string, thread: Thread): Mention[] {
  const mentions: Mention[] = []
  const find = findMentions(message, mentions)
  for (let user of thread.participants) {
    find(`@${user.name}`, user.id)
    find(`@${user.name.split(' ')[0]}`, user.id)
    if (thread.nicknames && thread.nicknames[user.id]) find(`@${thread.nicknames[user.id]}`, user.id)
  }
  log.trace('mentions', mentions)
  return mentions
}
function findMentions (message: string, mentions: Mention[]) {
  return (searchString: string, id: string) => {
    const offset = message.toLowerCase().indexOf(searchString.toLowerCase())
    if (offset !== -1) mentions.push({ offset, length: searchString.length, id })
  }
}
