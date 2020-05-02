export default function timezonedDate (): string {
  const date = new Date()
  date.setMinutes(date.getMinutes() + getOffset())
  return date.toJSON().split('.')[0]
}

// https://stackoverflow.com/a/44118363
function isValidTimeZone (tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz })
    return true
  } catch (ex) {
    return false
  }
}

function getOffset (): number {
  const offset = -(new Date()).getTimezoneOffset()
  if (global.config && config.timezone && isValidTimeZone(config.timezone)) {
    // https://stackoverflow.com/a/36146278
    const date = new Date()
    const arr = date.toLocaleString('ja', { timeZone: config.timezone }).split(/[/\s:]/)
    // @ts-ignore
    arr[1]--
    // @ts-ignore
    return ((Date.UTC.apply(null, arr) - new Date(date).setMilliseconds(0)) / 60 / 1000) || offset
  }
  return offset
}
