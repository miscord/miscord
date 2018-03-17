module.exports = () => {
  const yn = require('yn')
  var config = {
    facebook: {
      username: process.env.FACEBOOK_USERNAME,
      password: process.env.FACEBOOK_PASSWORD,
      forceLogin: yn(process.env.FACEBOOK_FORCE_LOGIN),
      showUsername: yn(process.env.FACEBOOK_SHOW_USERNAME),
      boldUsername: yn(process.env.FACEBOOK_BOLD_USERNAME),
      filter: {
        whitelist: (process.env.FACEBOOK_FILTER_WHITELIST || '').split(',').filter(el => el), // sort out empty elements
        blacklist: (process.env.FACEBOOK_FILTER_BLACKLIST || '').split(',').filter(el => el) // sort out empty elements
      }
    },
    discord: {
      token: process.env.DISCORD_TOKEN,
      guild: process.env.DISCORD_GUILD,
      category: process.env.DISCORD_CATEGORY,
      sendNotifications: yn(process.env.DISCORD_SEND_NOTIFICATIONS)
    },
    checkUpdates: yn(process.env.MISCORD_CHECK_UPDATES),
    logLevel: process.env.MISCORD_LOG_LEVEL
  }
  if (!config.discord.token || !config.facebook.username || !config.facebook.password) {
    require('../error.js')('Env: token/username/password missing.')
  }
  return config
}
