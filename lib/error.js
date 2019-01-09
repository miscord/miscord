const log = logger.withScope('errorHandler')
const Sentry = require('@sentry/node')

const dataPath = process.env.DATA_PATH !== 'undefined' ? process.env.DATA_PATH : undefined
module.exports = async error => {
  log.error(error)
  Sentry.captureException(error)

  console.log('')
  log.warn(`Logs from NPM are unnecessary and don't give much information.
  Miscord logs folder:
  ${dataPath || require('../lib/config/getConfigDir')()}/logs`)

  if (global.discord && discord.channels && discord.channels.error) {
    try {
      let errorMessage = error instanceof Error
        ? `${error.message}\n${error.stack}`
        : typeof error !== 'string' ? JSON.stringify(error) : error
      if (errorMessage.length >= 1900) {
        for (let i = 0; i < errorMessage.length; i += 1900) {
          await discord.channels.error.send(errorMessage.substring(i, i + 1900), { code: true })
        }
      } else {
        await discord.channels.error.send(errorMessage, { code: true })
      }
    } catch (err) {
      log.fatal(err)
      Sentry.captureException(err)
    } finally {
      await Sentry.getCurrentHub().getClient().close(2000)
      console.error('close')
    }
  } else {
    await Sentry.getCurrentHub().getClient().close(2000)
    console.error('close')
  }
}
module.exports.initSentry = () => {
  const pkg = require('../package.json')
  Sentry.init({
    dsn: 'https://15b7149e8a6945468707c0278bd812e8@sentry.io/1358880',
    maxBreadcrumbs: 0, // important, as it shows console messages
    release: `miscord@${pkg.version}`
  })
  Sentry.configureScope(scope => {
    scope.setTag('is_packaged', Boolean(process.pkg).toString().toLowerCase())
    scope.setTag('platform', require('os').platform())
    scope.setTag('version', pkg.version)
    scope.setTag('node_version', process.version)
  })
}
