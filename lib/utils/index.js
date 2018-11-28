module.exports = {}

module.exports.checkMKeep = m => m.toLowerCase().startsWith('m!keep')
module.exports.checkIgnoredSequences = m => config.ignoredSequences.map(r => new RegExp(r)).some(r => r.test(m))
