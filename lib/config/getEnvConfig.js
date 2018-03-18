module.exports = () => {
  const yn = require('yn')
  var env = process.env
  var config = {
    facebook: {
      username: env.FACEBOOK_USERNAME,
      password: env.FACEBOOK_PASSWORD,
      forceLogin: yn(env.FACEBOOK_FORCE_LOGIN),
      showUsername: yn(env.FACEBOOK_SHOW_USERNAME),
      boldUsername: yn(env.FACEBOOK_BOLD_USERNAME),
      filter: {
        whitelist: (env.FACEBOOK_FILTER_WHITELIST || '').split(',').filter(el => el), // sort out empty elements
        blacklist: (env.FACEBOOK_FILTER_BLACKLIST || '').split(',').filter(el => el) // sort out empty elements
      }
    },
    discord: {
      token: env.DISCORD_TOKEN,
      guild: env.DISCORD_GUILD,
      category: env.DISCORD_CATEGORY,
      sendNotifications: yn(env.DISCORD_SEND_NOTIFICATIONS),
      noEmbeds: yn(env.DISCORD_NO_EMBEDS)
    },
    checkUpdates: yn(env.MISCORD_CHECK_UPDATES),
    logLevel: env.MISCORD_LOG_LEVEL
  }
  if (!config.discord.token || !config.facebook.username || !config.facebook.password) {
    require('../error.js')('Env: token/username/password missing.')
  }
  return config
}
