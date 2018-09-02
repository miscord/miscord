require('colors')
const pkg = require('../package.json')
const request = require('request')
const log = require('npmlog')
const semver = require('semver')

module.exports = async () => {
  log.info('updateNotifier', 'Checking for updates...')
  request.get('https://api.github.com/repos/miscord/miscord/releases/latest', {
    json: true,
    headers: { 'User-Agent': 'Miscord v' + pkg.version }
  }, (err, res, release) => {
    if (err) {
      log.error('updateNotifier', 'Something went wrong')
      log.error('updateNotifier', err)
      return
    }
    log.silly('updateNotifier: release', release)
    if (!release.tag_name) return log.warn('updateNotifier: Couldn\'t check updates', release)
    var latest = release.tag_name.substring(1, release.tag_name.length)
    log.silly('updateNotifier: release tag', release.tag_name)
    log.verbose('updateNotifier: release version', latest)
    log.verbose('updateNotifier: package version', pkg.version)
    if (semver.lt(pkg.version, latest)) console.log(`New version ${latest} available!`.green, `\nChangelog:\n${release.body}`.cyan)
  })
}
