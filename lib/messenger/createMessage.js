const log = require('npmlog')

module.exports = (message, nickname, source = 'Discord') => {
  let username
  let content

  if (source === 'Discord') {
    // copy message content to a new variable, as the cleanContent property is read-only
    content = message.cleanContent
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
    username = message.member ? (message.member.nickname || message.author.username) : message.author.username
  } else {
    content = message
    username = nickname
  }

  content = handleCustomEmoji(content)
  source = source === 'Discord' ? config.messenger.sourceFormat.discord : config.messenger.sourceFormat.messenger.replace('{name}', source)
  return config.messenger.format
    .replace('{username}', username)
    .replace('{content}', content)
    .replace('{message}', content)
    .replace('{source}', source)
    .replace('{newline}', '\n')
}

function handleCustomEmoji (message) {
  var matches = message.match(/<:[a-zA-Z0-9_]+:[0-9]+>/g)
  if (!matches) return message
  for (let match of matches) {
    var emoji = match.split(':')[1].split(':')[0]
    message = message.replace(match, `:${emoji}:`)
  }
  return message
}
