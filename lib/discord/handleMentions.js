// TODO: comment this

const log = logger.withScope('handleMentions')
module.exports = message => {
  log.trace('message', message)

  var matches = message.match(/@[^# ]{2,32}/g)
  log.trace('matches', toStr(matches))

  if (!matches || !matches[0]) return message

  const massMentions = ['@everyone', '@here']
  if (massMentions.some(massMention => message.includes(massMention)) && !config.discord.massMentions) {
    massMentions.forEach(massMention => { message = message.replace(new RegExp(massMention, 'g'), `\`${massMention}\``) })
  }

  for (let match of matches) {
    match = match.substr(1)
    var role = discord.guilds.getAll('roles').find(role => role.name.toLowerCase() === match.toLowerCase())
    log.trace('role', toStr(role))
    if (role) {
      log.debug(`Mentioning role ${match}`)
      if (!role.mentionable) log.warn(`Role ${match} not mentionable!`)
      message = message.replace(`@${match}`, role)
      break
    }

    var user = discord.guilds.getAll('members').find(user =>
      (user.nickname && user.nickname.toLowerCase() === match.toLowerCase()) ||
      (user.user.username.toLowerCase() === match.toLowerCase())
    )
    log.trace('user', toStr(user))
    if (user) {
      log.debug(`Mentioning user ${match}`)
      message = message.replace(`@${match}`, user)
    }
  }

  return message
}
