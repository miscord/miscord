const log = logger.withScope('updateNotifier')

import fs from 'fs-extra'
import semver from 'semver'
import chalk from 'chalk'
import fetch from 'node-fetch'

export default async () => {
  const pkg = await fs.readJSON('../package.json')

  log.info('Checking for updates...')
  let res
  try {
    res = await fetch('https://api.github.com/repos/miscord/miscord/releases/latest', {
      headers: { 'User-Agent': 'Miscord v' + pkg.version }
    })
  } catch (err) {
    log.error('Something went wrong', err)
    return
  }
  const release = await res.json()

  log.trace('release', release)
  if (!release.tag_name) return log.warn('Couldn\'t check updates', release)
  const latest = release.tag_name.substring(1, release.tag_name.length)
  log.trace('release tag', release.tag_name)
  log.debug('release version', latest)
  log.debug('package version', pkg.version)
  if (semver.lt(pkg.version, latest)) console.log(chalk.green(`New version ${latest} available!`), chalk.cyan(`\nChangelog:\n${release.body}`))
}
