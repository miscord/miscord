module.exports = message => {
  var matches = message.match(/<:[a-zA-Z0-9_]+:[0-9]+>/)
  if (!matches) return message
  for (let match of matches) {
    var emoji = match.split(':')[1].split(':')[0]
    message = message.replace(match, `:${emoji}:`)
  }
  return message
}
