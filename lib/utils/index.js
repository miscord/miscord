module.exports = {}

module.exports.checkMKeep = m => m.toLowerCase().startsWith('m!keep')
module.exports.checkIgnoredSequences = m => config.ignoredSequences.map(r => new RegExp(r)).some(r => r.test(m))
module.exports.truncatePeople = people => people.length > 10 ? people.slice(0, 10).join(', ') + ` and ${people.length - 10} more...` : people.join(', ')
