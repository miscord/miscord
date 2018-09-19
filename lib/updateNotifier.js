require('colors')
const pkg = require('../package.json')
const request = require('request')
const log = logger.withScope('updateNotifier')
const semver = require('semver')

module.exports = async () => {
  log.info('Checking for updates...')
  request.get('https://api.github.com/repos/miscord/miscord/releases/latest', {
    json: true,
    headers: { 'User-Agent': 'Miscord v' + pkg.version }
  }, (err, res, release) => {
    if (err) {
      log.error('Something went wrong')
      log.error(err)
      return
    }
    log.trace('release', release)
    if (!release.tag_name) return log.warn('Couldn\'t check updates', release)
    var latest = release.tag_name.substring(1, release.tag_name.length)
    log.trace('release tag', release.tag_name)
    log.debug('release version', latest)
    log.debug('package version', pkg.version)
    if (semver.lt(pkg.version, latest)) console.log(`New version ${latest} available!`.green, `\nChangelog:\n${release.body}`.cyan)
  })
}
