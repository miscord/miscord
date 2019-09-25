export default class MapWithFilter extends Map {
  constructor (data) {
    super(data)
  }

  filter (predicate) {
    return new MapWithFilter(Array.from(this.entries()).filter(([ id, entry ], index, array) => predicate(entry, index, array)))
  }

  toArray () {
    return Array.from(this).map(([ , entry ]) => entry)
  }
}
