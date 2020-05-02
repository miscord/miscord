import removeAccents from 'remove-accents'
import getSender from './getSender'
import { Thread } from 'libfb'

const log = logger.withScope('messenger:getThreadName')
export default async function getThreadName (thread: Thread, clean = true): Promise<string> {
  // get thread name / user
  let name
  try {
    name = thread.isGroup
      ? (thread.name || thread.id)
      : (
        (thread.nicknames ? thread.nicknames.get(thread.id) : null) || (await getSender(thread.id))?.name
      )
  } catch (err) {
    name = thread.name || thread.id
  }
  log.debug('raw channel name', name)

  if (!clean) return name

  // clean name for the needs of discord channel naming
  const cleanname = removeAccents(name.toString())
    .trim()
    .replace(/ /g, '-')
    .replace(/\W-/g, '')
    .replace(/(?![a-zA-Z0-9\-_])/g, '')
    .toLowerCase()
    .substr(0, 100)
  log.debug('clean thread name', cleanname)

  return cleanname
}
