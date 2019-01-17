// TODO: comment this

const log = logger.withScope('handleMentions')
module.exports = message => {
  log.trace('message', message)
  // Handles @everyone / @here, goes through the message replacing plaintext with the proper mentions.
  const massMentions = ['@everyone', '@here']
  if (massMentions.some(massMention => message.includes(massMention)) && !config.discord.massMentions) {
    massMentions.forEach(massMention => { message = message.replace(new RegExp(massMention, 'g'), `\`${massMention}\``) })
  }
  // Finds any potential @s and excludes anything preceeding spaces/hashtags within a 2-32 character limit globally.
  const matches = message.match(/@[^# ]{2,32}/g)
  log.trace('matches', matches)
  // If no matches, or usermentions is disabled, return.
  if (!matches || !matches[0] || !config.discord.userMentions) return message
  /*
    We go through each role or user match finding first roles.
    If no role is found, we then find a user.

    Bug: If a role is found in one server, it will copy the role ID to other servers
    this will show "@deleted-role" for other servers, similarly if we copy a user ID that
    does not exist in the server, they will not be pingable which is OK. We should only
    ping the user once and just utilize the topmost server.
  */
  for (let match of matches) {
    // Exclude @
    match = match.substr(1)
    // Go through each role in each guild the bot is in, and try to find the role.
    const role = discord.guilds.getAll('roles').find(role => role.name.toLowerCase() === match.toLowerCase())
    log.trace('role', role)
    if (role) {
      log.debug(`Mentioning role ${match}`)
      if (!role.mentionable) log.warn(`Role ${match} not mentionable!`)
      message = message.replace(`@${match}`, role)
      continue
    }

    const user = discord.guilds.getAll('members').find(user =>
      (user.nickname && user.nickname.toLowerCase() === match.toLowerCase()) ||
      (user.user.username.toLowerCase() === match.toLowerCase())
    )
    log.trace('user', user)
    if (user) {
      log.debug(`Mentioning user ${match}`)
      if (user === 'deleted-role') {
        log.debug(`deleted-role found? ${match}`)
        log.trace('deleted-role found?')
      } else {
        message = message.replace(`@${match}`, user)
      }
    }
  }

  return message
}
