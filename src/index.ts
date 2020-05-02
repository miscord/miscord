/* eslint-disable @typescript-eslint/no-misused-promises */
import login from './login'
import api from './api'
import discordListener from './discord/listener'
import messengerListener from './messenger/listener'
import messengerEventListener from './messenger/handleEvent'

export default async function main (): Promise<void> {
  await login()

  if (process.send) {
    process.send('login successful')
  }

  if (config.api && (
    (config.api.username && config.api.password) ??
    config.api.key
  )) api()

  // when got a discord message
  discord.client.on('message', discordListener)

  // when got a messenger message
  messenger.client.on('message', messengerListener)

  // when got a messenger event
  messenger.client.on('event', messengerEventListener)

  const { version } = require('../package.json') as { version: string }

  await discord.client.user.setActivity('Miscord v' + version)
}
