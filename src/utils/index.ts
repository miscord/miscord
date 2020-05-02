import { Guild, User } from 'discord.js'

export function checkMKeep (m: string): boolean {
  return m.toLowerCase().startsWith('m!keep')
}

export function checkIgnoredSequences (m: string): boolean {
  return Array.isArray(config.ignoredSequences) &&
    config.ignoredSequences.map(r => new RegExp(r)).some(r => r.test(m))
}

export function truncatePeople (people: string[]): string {
  return people.length > 10
    ? people.slice(0, 10).join(', ') + ` and ${people.length - 10} more...`
    : people.join(', ')
}

export function splitString (str: string, fragmentLength: number): string[] {
  return str.length > fragmentLength
    ? str.match(new RegExp(`[\\s\\S]{1,${fragmentLength}}`, 'g')) ?? []
    : [ str ]
}

export function hasAdmin (user: User, guild: Guild): boolean {
  const member = guild.members.find(member => user.id === member.id)
  return member.hasPermission('ADMINISTRATOR') || guild.ownerID === user.id
}
