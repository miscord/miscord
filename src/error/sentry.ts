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
  'MQTT connection failed' // Facebook MQTT connection fail
]

export function sendToSentry (error: Error) {
  if (bannedErrors.some(banned => error.toString().includes(banned) || error.message.includes(banned))) return
  Sentry.captureException(error)
}

export function initSentry () {
  const pkg = require('../../package.json')
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

export function closeSentry () {
  return Sentry.getCurrentHub().getClient()!!.close(2000)
}
