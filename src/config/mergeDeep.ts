// https://stackoverflow.com/a/48218209/
export default function mergeDeep (...objects: any): any {
  const isObject = (obj: any): boolean => obj && typeof obj === 'object' && !Array.isArray(obj)

  return objects.reduce((prev: any, obj: any) => {
    Object.keys(obj).forEach(key => {
      if (obj[key] == null && prev[key] != null) return
      prev[key] = isObject(prev[key]) && isObject(obj[key]) ? mergeDeep(prev[key], obj[key]) : obj[key]
    })
    return prev
  }, {})
}
