export default function handleCustomEmoji (message: string): string {
  const matches = message.match(/<a?:[a-zA-Z0-9_]+:[0-9]+>/g)
  if (!matches) return message

  for (const match of matches) {
    const emoji = (match.match(/<a?(:[a-zA-Z0-9_]+:)[0-9]+>/) ?? [])[1]
    message = message.replace(match, emoji)
  }

  return message
}
