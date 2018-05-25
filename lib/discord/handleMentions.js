// TODO: comment this

const log = require('npmlog')
module.exports = message => {
  log.silly('handleMentions: message', message)

  var matches = message.match(/@[^# ]{2,32}/g)
  log.silly('handleMentions: matches', matches)

  if (!matches || !matches[0]) return message

  for (let match of matches) {
    match = match.substr(1)
    var role = config.discord.guild.roles.find(role => role.name.toLowerCase() === match.toLowerCase())
    log.silly('handleMentions: role', role)
    if (role) {
      log.verbose('handleMentions', 'Mentioning role', match)
      if (!role.mentionable) log.warn('handleMentions', 'Role', match, 'not mentionable!')
      message = message.replace(`@${match}`, role)
      break
    }

    var user = config.discord.guild.members.find(user =>
      (user.nickname && user.nickname.toLowerCase() === match.toLowerCase()) ||
      (user.user.username.toLowerCase() === match.toLowerCase())
    )
    log.silly('handleMentions: user', user)
    if (user) {
      log.verbose('handleMentions', 'Mentioning user', match)
      message = message.replace(`@${match}`, user)
    }
  }

  return message
}
