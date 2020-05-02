const log = logger.withScope('handleEmojis')

export default function handleEmojis (message: string): string {
  let matches = message.match(/:[^: ]*:/g)
  if (!matches || !matches[0]) return message

  log.trace('Emojis found', matches)

  // Match first result and attach it as emote will not parse otherwise.
  // We must use a handler to track which emojis have already been used.
  matches = [ ...new Set(matches) ] // removes duplicates

  for (const match of matches) {
    const emoji = discord.client.emojis.find(emoji => emoji.name.toLowerCase() === match.replace(/:/g, '').toLowerCase())
    if (emoji) {
      log.debug(`found an emoji ${match}`)
      message = message.replace(new RegExp(match, 'g'), emoji.toString())
    } else {
      log.debug(`No emoji found for ${match}...`)
    }
  }

  return message
}
