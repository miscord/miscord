const pkg = require('../package.json')
const superagent = require('superagent')
const chalk = require('chalk')
const log = require('npmlog')

module.exports = async loglevel => {
  log.info('updateNotifier', 'Checking for updates...')
  try {
    var release = (await superagent.get('https://api.github.com/repos/Bjornskjald/miscord/releases/latest')).body
    log.silly('updateNotifier', release)
    var latest = release.tag_name.substring(1, release.tag_name.length)
    log.silly('updateNotifier', 'Release tag: %s', release.tag_name)
    log.silly('updateNotifier', 'Release version: %s', latest)
    log.silly('updateNotifier', 'Package version: %s', pkg.version)
    if (pkg.version < latest) console.log(chalk.green(`New version ${latest} available!`), chalk.cyan(`\nChangelog:\n${release.body}`))
  } catch (err) {
    log.error('updateNotifier', 'Something went wrong')
    log.error('updateNotifier', err)
  }
}
