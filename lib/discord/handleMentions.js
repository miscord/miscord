// TODO: comment this

const log = require('npmlog')
module.exports = (config, message, returnOnlyMention = false) => {
  log.silly('handleMentions: message', message)

  var matches = message.match(/@[^# ]{2,32}/)
  log.silly('handleMentions: matches', matches)

  if (!matches || !matches[0]) return returnOnlyMention ? undefined : message

  if (returnOnlyMention) message = ''

  for (let match of matches) {
    match = match.substr(1)
    var role = config.discord.guild.roles.find('name', match)
    log.silly('handleMentions: role', role)
    if (role) {
      log.verbose('handleMentions', 'Mentioning role', match)
      if (!role.mentionable) log.warn('handleMentions', 'Role', match, 'not mentionable!')
      message = returnOnlyMention ? `${message}${role} ` : message.replace(/@[^# ]{2,32}/, role)
      break
    }

    var user = config.discord.guild.members.find('nickname', match)
    if (!user) user = config.discord.guild.members.find(member => member.user.username === match)
    log.silly('handleMentions: user', user)
    if (user) {
      log.verbose('handleMentions', 'Mentioning user', match)
      message = returnOnlyMention ? `${message}${user.toString()} ` : message.replace(/@[^# ]{2,32}/, user.toString())
    }

    if ((match === 'everyone' || match === 'here') && returnOnlyMention) message += `@${match} `
  }

  return message
}
