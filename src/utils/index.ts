export function checkMKeep (m: string) { return m.toLowerCase().startsWith('m!keep') }
export function checkIgnoredSequences (m: string) {
  return Array.isArray(config.ignoredSequences) && config.ignoredSequences.map(r => new RegExp(r)).some(r => r.test(m))
}
export function truncatePeople (people: string[]) { return people.length > 10 ? people.slice(0, 10).join(', ') + ` and ${people.length - 10} more...` : people.join(', ') }
