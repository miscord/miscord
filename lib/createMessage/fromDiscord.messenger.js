const log = require('npmlog')
const handleCustomEmoji = require('./handleCustomEmoji')
const getStreamFromURL = require('./getStreamFromURL')

module.exports = async message => {
  let username = message.member ? (message.member.nickname || message.author.username) : message.author.username
  let content = message.cleanContent
  content = handleCustomEmoji(content)

  // copy message content to a new variable, as the cleanContent property is read-only
  log.verbose('discordListener: clean content', content)

  // parse embed into plaintext
  if (message.embeds.length > 0 && !config.messenger.ignoreEmbeds) {
    message.embeds.forEach(embed => {
      if (embed.title) content += '\n' + embed.title
      if (embed.url && !content.includes(embed.url)) content += '\n(' + embed.url + ')'
      if (embed.description) content += '\n' + embed.description
      embed.fields.forEach(field => { content += '\n\n' + field.name + '\n' + field.value })
    })
    log.verbose('discordListener: content with embed', content)
  }

  const body = config.messenger.format
    .replace('{username}', username)
    .replace('{content}', content)
    .replace('{message}', content)
    .replace('{source}', config.messenger.sourceFormat.discord)
    .replace('{newline}', '\n')

  // get image url from discord embeds
  const embedImageURL = message.embeds.length > 0
    ? (message.embeds[0].image
      ? message.embeds[0].image.url
      : (message.embeds[0].thumbnail
        ? message.embeds[0].thumbnail.url
        : undefined
      )
    )
    : undefined

  const attachment = await Promise.all([embedImageURL].concat(message.attachments.map(attach => attach.url)).filter(el => el).map(getStreamFromURL))
  return { body, attachment }
}
