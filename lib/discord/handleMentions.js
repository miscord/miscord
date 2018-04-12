const log = require('npmlog')
module.exports = (config, message, returnOnlyMention = false) => {
  log.silly('handleMentions: message', message)

  var matches = message.match(/@[^# ]{2,32}/)
  log.silly('handleMentions: matches', matches)

  if (!matches || !matches[0]) return returnOnlyMention ? undefined : message

  for (let match of matches) {
    match = match.substr(1)
    var role = config.discord.guild.roles.find('name', match)
    log.silly('handleMentions: role', role)
    if (role) {
      log.verbose('handleMentions', 'Mentioning role', match)
      if (role.mentionable) message = returnOnlyMention ? role.toString() : message.replace(/@[^# ]{2,32}/, role.toString())
      else log.verbose('handleMentions', 'Role', match, 'not mentionable!')
      break
    }

    var user = config.discord.guild.members.find('nickname', match)
    if (!user) user = config.discord.guild.members.find(member => member.user.username === match)
    log.silly('handleMentions: user', user)
    if (user) {
      log.verbose('handleMentions', 'Mentioning user', match)
      message = returnOnlyMention ? user.toString() : message.replace(/@[^# ]{2,32}/, user.toString())
    }
  }

  return returnOnlyMention ? undefined : message
}
