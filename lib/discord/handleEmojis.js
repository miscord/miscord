/*
  This will grab any emojis being sent and parse them we do this as Bots have built in nitro.
*/
const log = logger.withScope('handleEmojis')
module.exports = message => {
  const matches = message.match(/:[^ ]*:/g)
  log.trace('Emojis found', matches)

  if (!matches || !matches[0]) return message
  // Match first result and attach it as emote will not parse otherwise.
  for (let match of matches) {
    const emoji = discord.emojis.find(emoji => emoji.name.toLowerCase() === match.replace(':', '').toLowerCase())
    if (emoji) {
      log.debug(`found an emoji ${match}`)
      message = message.replace(`@${match}`, emoji)
    }
  }
  return message
}
