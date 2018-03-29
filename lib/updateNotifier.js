require('colors')
const pkg = require('../package.json')
const superagent = require('superagent')
const log = require('npmlog')

module.exports = async loglevel => {
  log.info('updateNotifier', 'Checking for updates...')
  try {
    var release = (await superagent.get('https://api.github.com/repos/Bjornskjald/miscord/releases/latest')).body
    log.silly('updateNotifier: release', release)
    var latest = release.tag_name.substring(1, release.tag_name.length)
    log.silly('updateNotifier: release tag', 'Release tag: %s', release.tag_name)
    log.verbose('updateNotifier: release version', latest)
    log.verbose('updateNotifier: package version', pkg.version)
    if (newer(pkg.version, latest)) console.log(`New version ${latest} available!`.green, `\nChangelog:\n${release.body}`.cyan)
  } catch (err) {
    log.error('updateNotifier', 'Something went wrong')
    log.error('updateNotifier', err)
  }
}

// https://stackoverflow.com/a/6832721
function newer (v1, v2) {
  var v1parts = v1.split('.')
  var v2parts = v2.split('.')

  if (!v1parts.every(x => /^\d+$/.test(x)) || !v2parts.every(x => /^\d+$/.test(x))) return false

  v1parts = v1parts.map(Number)
  v2parts = v2parts.map(Number)

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) return false
    if (v1parts[i] === v2parts[i]) continue
    else if (v1parts[i] > v2parts[i]) return false
    else return true
  }
  return v1parts.length !== v2parts.length
}
