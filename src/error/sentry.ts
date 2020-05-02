import * as Sentry from '@sentry/node'
import { platform } from 'os'

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
  'MQTT connection failed', // Facebook MQTT connection fail
  'EPIPE', // Facebook session invalidated
  'No guilds added!' // client.guilds is empty
]

export function sendToSentry (error: Error): void {
  if (bannedErrors.some(banned => error?.toString().includes(banned) || error.message.includes(banned))) return
  Sentry.captureException(error)
}

export function initSentry (): void {
  const { version } = require('../../package.json') as { version: string }
  Sentry.init({
    dsn: 'https://a24e24e8c74f496db5fce2d611e085ee@sentry.miscord.net/2',
    maxBreadcrumbs: 0, // important, as it shows console messages
    release: `miscord@${version}`
  })
  Sentry.configureScope(scope => {
    scope.setTag('is_packaged', process.pkg ? 'true' : 'false')
    scope.setTag('platform', platform())
    scope.setTag('version', version)
    scope.setTag('node_version', process.version)
  })
}

export function closeSentry (): void {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  Sentry?.getCurrentHub().getClient()?.close(2000)
}
