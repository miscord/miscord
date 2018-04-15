// TODO: comment this

const log = require('npmlog')
module.exports = (config, message) => {
  log.silly('handleMentions: message', message)

  var matches = message.match(/@[^# ]{2,32}/)
  log.silly('handleMentions: matches', matches)

  if (!matches || !matches[0]) return message

  for (let match of matches) {
    match = match.substr(1)
    var role = config.discord.guild.roles.find('name', match)
    log.silly('handleMentions: role', role)
    if (role) {
      log.verbose('handleMentions', 'Mentioning role', match)
      if (!role.mentionable) log.warn('handleMentions', 'Role', match, 'not mentionable!')
      message = message.replace(/@[^# ]{2,32}/, role)
      break
    }

    var user = config.discord.guild.members.find('nickname', match)
    if (!user) user = config.discord.guild.members.find(member => member.user.username === match)
    log.silly('handleMentions: user', user)
    if (user) {
      log.verbose('handleMentions', 'Mentioning user', match)
      message = message.replace(/@[^# ]{2,32}/, user.toString())
    }
  }

  return message
}
