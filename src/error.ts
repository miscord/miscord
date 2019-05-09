import { CMError } from './ConnectionsManager'
import { isNpm } from 'is-npm'
import * as Sentry from '@sentry/node'

import { platform } from 'os'

const log = logger.withScope('errorHandler')

const bannedErrors = [
  'Token/username/password not found.', // incorrect config
  'Missing Permissions', // incorrect Discord permissions
  'Missing Access', // incorrect Discord permissions
  'Incorrect login details were provided.', // incorrect Discord token
  'Invalid username or email address', // incorrect Facebook credentials
  'Invalid username or password', // incorrect Facebook credentials
  'User must verify their account', // Facebook login review
  'Service temporarily unavailable', // Facebook is down
  'ECONNRESET', // connection reset
  'MQTT connection failed' // Facebook MQTT connection fail
]
const isErrorBanned = (error: Error) => bannedErrors.some(banned => error.toString().includes(banned) || error.message.includes(banned)) || error instanceof CMError
const errorDescriptions = {
  'Invalid username or email address': `
Couldn't login to Facebook.
Check your username/email address, it may be incorrect.
`,
  'Invalid username or password': `
Couldn't login to Facebook.
Check your password or preferrably, use an app password:
http://facebook.com/settings?tab=security&section=per_app_passwords&view
`,
  'Incorrect login details were provided.': `
Couldn't login to Discord.
Check your token.
(it shouldn't be client ID nor anything else that doesn't have "token" in its name)
`
}
const getErrorDescription = (error: Error) => Object.keys(errorDescriptions).find(desc => error.toString().includes(desc))

const dataPath = process.env.DATA_PATH !== 'undefined' ? process.env.DATA_PATH : undefined

export default async (error: Error | string | { error?: any, err?: any }) => {
  if (!(error instanceof Error)) {
    if (typeof error === 'string') error = new Error(error)
    else if (error.err && error.err instanceof Error) error = error.err
    else if (error.error && error.error instanceof Error) error = error.error
    else error = new Error(error.toString())
  }

  // @ts-ignore
  const exitCode = (error.requestArgs || error instanceof CMError) ? 'close 1' : 'close 2'
  log.error('error', error)
  if (!isErrorBanned(error)) Sentry.captureException(error)

  const desc = getErrorDescription(error)
  if (desc) log.error(desc[1])

  if (isNpm) {
    log.warn(`Logs from NPM are unnecessary and don't give much information.
Miscord logs folder:
${dataPath || require('.//config/FileConfig').getConfigDir()}/logs`)
  }

  if (global.discord && discord.channels && discord.channels.error) {
    try {
      let errorMessage = `${error.message}\n${error.stack}`
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
      await cleanup(exitCode)
    }
  } else {
    await cleanup(exitCode)
  }
  async function cleanup (exitCode: string) {
    await Sentry.getCurrentHub().getClient()!!.close(2000)
    if (global.discord) await discord.client.destroy()
    console.error(exitCode)
  }
}
export function initSentry () {
  const pkg = require('../package.json')
  Sentry.init({
    dsn: 'https://a24e24e8c74f496db5fce2d611e085ee@sentry.miscord.net/2',
    maxBreadcrumbs: 0, // important, as it shows console messages
    release: `miscord@${pkg.version}`
  })
  Sentry.configureScope(scope => {
    scope.setTag('is_packaged', Boolean(process.pkg).toString().toLowerCase())
    scope.setTag('platform', platform())
    scope.setTag('version', pkg.version)
    scope.setTag('node_version', process.version)
  })
}
