const log = logger.withScope('errorHandler')

import { isNpm } from 'is-npm'
import { closeSentry, sendToSentry } from './sentry'
import { splitString } from '../utils'
import getErrorDescription from './getErrorDescription'
import { getConfigDir } from '../config/FileConfig'

const dataPath = process.env.DATA_PATH !== 'undefined' ? process.env.DATA_PATH : undefined

function tryToGetTheActualError (e: any): Error | void {
  if (e instanceof Error) return e
  if (e.error) return tryToGetTheActualError(e.error)
  if (e.err) return tryToGetTheActualError(e.err)
  return e
}

export default async (error: Error | string | { error?: any, err?: any }) => {
  if (!(error instanceof Error)) {
    const possibleError = tryToGetTheActualError(error)

    if (typeof error === 'string') error = new Error(error)
    else if (possibleError) error = possibleError
    else error = new Error(error.toString())
  }

  const exitCode = (
    // @ts-ignore
    error.requestArgs ||
    error.message.includes('Incorrect login details were provided') ||
    error.message.includes('EPIPE')
  ) ? 1 : 2
  log.error('', error)
  sendToSentry(error)

  const desc = getErrorDescription(error)
  if (desc) log.error(desc)

  if (isNpm) {
    log.warn(`Logs from NPM are unnecessary and don't give much information.
Miscord logs folder:
${dataPath || getConfigDir()}/logs`)
  }

  if (global.discord && discord.channels && discord.channels.error) {
    try {
      let errorMessage = splitString(`${error.message}\n${error.stack}`, 1000)
      for (let part of errorMessage) await discord.channels.error.send(part, { code: true })
      await discord.channels.error.send(desc)
    } catch (err) {
      log.fatal(err)
      sendToSentry(err)
    }
  }

  await closeSentry()
  if (global.discord) await discord.client.destroy()
  console.error(`close ${exitCode}`)
}
