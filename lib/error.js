const log = logger.withScope('errorHandler')
module.exports = async error => {
  log.error(error)

  console.log('')
  log.warn(`Logs from NPM are unnecessary and don't give much information.
  Miscord logs folder:
  ${require('../lib/config/getConfigDir')()}/logs`)

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
    } finally {
      console.error('close')
    }
  } else {
    console.error('close')
  }
}
