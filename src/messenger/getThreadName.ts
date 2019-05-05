import removeAccents from 'remove-accents'
import getSender from './getSender'

const log = logger.withScope('messenger:getThreadName')
export default async (thread: any, clean = true) => {
  // get thread name / user
  let name
  try {
    name = thread.isGroup
      ? (thread.name || thread.id)
      : (
        (thread.nicknames ? thread.nicknames[thread.id] : null) || (await getSender(thread.id))!!.name
      )
  } catch (err) {
    name = thread.name || thread.id
  }
  log.debug('raw channel name', name)

  if (!clean) return name

  // clean name for the needs of discord channel naming
  const cleanname = removeAccents(name.toString()).trim().replace(/ /g, '-').replace(/\W-/g, '').replace(/(?![a-zA-Z0-9\-_])/g, '').toLowerCase()
  log.debug('clean thread name', cleanname)

  return cleanname
}
