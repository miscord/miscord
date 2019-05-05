const log = logger.withScope('config:diff')
export default (o1: any, o2: any) => {
  return Object.keys(o2).reduce((diff, key) => {
    log.trace('diff key', key)
    if (JSON.stringify(o1[key]) === JSON.stringify(o2[key])) return diff
    return {
      ...diff,
      [key]: o2[key]
    }
  }, {})
}
