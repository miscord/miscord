module.exports = message => {
  const matches = message.match(/<:[a-zA-Z0-9_]+:[0-9]+>/g)
  if (!matches) return message
  for (let match of matches) {
    const emoji = match.split(':')[1].split(':')[0]
    message = message.replace(match, `:${emoji}:`)
  }
  return message
}
