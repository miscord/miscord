import { isNpm } from 'is-npm'
import { closeSentry, sendToSentry } from './sentry'
import { splitString } from '../utils'
import getErrorDescription from './getErrorDescription'
import { getConfigDir } from '../config/FileConfig'
import { inspect } from 'util'

const log = logger.withScope('errorHandler')

const dataPath = process.env.DATA_PATH !== 'undefined' ? process.env.DATA_PATH : undefined

function tryToGetTheActualError (e: any): Error | void {
  if (e instanceof Error) return e
  if (e.error) return tryToGetTheActualError(e.error)
  if (e.err) return tryToGetTheActualError(e.err)
  return e
}

export async function reportError (error: Error): Promise<void> {
  log.error('', error)
  sendToSentry(error)

  const desc = getErrorDescription(error)
  if (desc) log.error(desc)

  if (global.discord && discord.channels && discord.channels.error) {
    try {
      const errorMessage = splitString(`${error.message}\n${error.stack as string}`, 1000)
      for (const channel of discord.channels.error) {
        for (const part of errorMessage) await channel.send(part, { code: true })
        if (desc) await channel.send(desc)
      }
    } catch (err) {
      log.fatal(err)
      sendToSentry(err)
    }
  }
}

export default async function handleError (error: Error | string | { error?: any, err?: any }): Promise<void> {
  if (!(error instanceof Error)) {
    const possibleError = tryToGetTheActualError(error)

    if (typeof error === 'string') error = new Error(error)
    else if (possibleError) error = possibleError
    else error = new Error(inspect(error))
  }

  const exitCode = (
    // @ts-ignore
    error.requestArgs ||
    error.message.includes('Incorrect login details were provided') ||
    error.message.includes('EPIPE') ||
    error.message.includes('No guilds added!')
  ) ? 1 : 2

  await reportError(error)

  if (isNpm) {
    log.warn(`Logs from NPM are unnecessary and don't give much information.
Miscord logs folder:
${dataPath ?? getConfigDir()}/logs`)
  }

  await closeSentry()
  if (global.discord) await discord.client.destroy()
  console.error(`close ${exitCode}`)
}
