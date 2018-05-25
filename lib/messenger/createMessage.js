module.exports = (username, content, source = 'Discord') => {
  content = handleCustomEmoji(content)
  source = source === 'Discord' ? config.messenger.sourceFormat.discord : config.messenger.sourceFormat.messenger.replace('{name}', source)
  return config.messenger.format
    .replace('{username}', username)
    .replace('{content}', content)
    .replace('{message}', content)
    .replace('{source}', source)
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
