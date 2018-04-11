const log = require('npmlog')
module.exports = (config, message, returnOnlyMention = false) => {
  log.silly('handleMentions: message', message)

  var match = message.match(/@[^# ]{2,32}/)
  log.silly('handleMentions: match', match)

  if (!match || !match[0]) return message
  match = match[0].substr(1)

  var role = config.discord.guild.roles.find('name', match)
  log.silly('handleMentions: role', role)
  if (role) log.verbose('handleMentions', 'Mentioning role', match)
  if (role && role.mentionable) return returnOnlyMention ? role.toString() : message.replace(/@[^# ]{2,32}/, role.toString())

  var user = config.discord.guild.members.find('nickname', match)
  if (!user) user = config.discord.guild.members.find(member => member.user.username === match)
  log.silly('handleMentions: user', user)
  if (user) log.verbose('handleMentions', 'Mentioning user', match)
  if (user) return returnOnlyMention ? user.toString() : message.replace(/@[^# ]{2,32}/, user.toString())

  return message
}
