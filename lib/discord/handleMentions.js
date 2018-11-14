// TODO: comment this

const log = logger.withScope('handleMentions')
module.exports = message => {
  log.trace('message', message)

  const massMentions = ['@everyone', '@here']
  if (massMentions.some(massMention => message.includes(massMention)) && !config.discord.massMentions) {
    massMentions.forEach(massMention => { message = message.replace(new RegExp(massMention, 'g'), `\`${massMention}\``) })
  }

  const matches = message.match(/@[^# ]{2,32}/g)
  log.trace('matches', matches)

  if (!matches || !matches[0] || !config.discord.userMentions) return message

  for (let match of matches) {
    match = match.substr(1)
    const role = discord.guilds.getAll('roles').find(role => role.name.toLowerCase() === match.toLowerCase())
    log.trace('role', role)
    if (role) {
      log.debug(`Mentioning role ${match}`)
      if (!role.mentionable) log.warn(`Role ${match} not mentionable!`)
      message = message.replace(`@${match}`, role)
      break
    }

    const user = discord.guilds.getAll('members').find(user =>
      (user.nickname && user.nickname.toLowerCase() === match.toLowerCase()) ||
      (user.user.username.toLowerCase() === match.toLowerCase())
    )
    log.trace('user', user)
    if (user) {
      log.debug(`Mentioning user ${match}`)
      message = message.replace(`@${match}`, user)
    }
  }

  return message
}
