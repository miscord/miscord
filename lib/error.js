const log = logger.withScope('errorHandler')
const Sentry = require('@sentry/node')

const bannedErrors = [
  'Token/username/password not found.', // incorrect config
  'Missing Permissions', // incorrect Discord permissions
  'Incorrect login details were provided.', // incorrect Discord token
  'Access token missing!', // incorrect Facebook credentials
  'MQTT connection failed' // Facebook MQTT connection fail
]

const dataPath = process.env.DATA_PATH !== 'undefined' ? process.env.DATA_PATH : undefined

module.exports = async error => {
  if (!(error instanceof Error)) {
    if (typeof error === 'string') error = new Error(error)
    if (error.err || error.error) {
      let err = error.err || error.error
      if (err instanceof Error) {
        error = err
      }
    }
  }
  const exitCode = error.requestArgs ? 'close 1' : 'close 2'
  log.error(error)
  if (!bannedErrors.some(banned => error.toString().includes(banned))) Sentry.captureException(error)

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
      await discord.client.destroy()
      console.error(exitCode)
    }
  } else {
    await Sentry.getCurrentHub().getClient().close(2000)
    if (global.discord) await discord.client.destroy()
    console.error(exitCode)
  }
}
module.exports.initSentry = () => {
  const pkg = require('../package.json')
  Sentry.init({
    dsn: 'https://58fe91e28af9416eade1597c9c5448c0@sentry.miscord.net/2',
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
