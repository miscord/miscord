/*
  This will grab any emojis being sent and parse them we do this as Bots have built in nitro.
*/
const log = logger.withScope('handleEmojis')
module.exports = message => {
  const matches = message.match(/:[^: ]*:/g)
  if (!matches || !matches[0]) return message
  log.trace('Emojis found', matches)
  log.debug(`found an emoji ${matches}`)
  // Match first result and attach it as emote will not parse otherwise.
  // We must use a handler to track which emojis have already been used.
  let emojiParsed = []
  for (let match of matches) {
    if (emojiParsed.includes(match)) {
      log.debug(`Emoji ${match} has already been parsed.`)
      continue
    }
    const emoji = discord.client.emojis.find(emoji => emoji.name.toLowerCase() === match.replace(/:/g, '').toLowerCase())
    if (emoji) {
      log.debug(`found an emoji ${match}`)
      message = message.replace(new RegExp(match, 'g'), emoji.toString())
      emojiParsed.push(match)
    } else {
      log.debug(`No emoji found for ${match}...`)
    }
  }
  return message
}
