module.exports = () => {
  var config = {
    facebook: {
      username: process.env.FACEBOOK_USERNAME,
      password: process.env.FACEBOOK_PASSWORD,
      forceLogin: process.env.FACEBOOK_FORCE_LOGIN,
      showUsername: process.env.FACEBOOK_SHOW_USERNAME,
      boldUsername: process.env.FACEBOOK_BOLD_USERNAME,
      filter: {
        whitelist: (process.env.FACEBOOK_FILTER_WHITELIST || '').split(','),
        blacklist: (process.env.FACEBOOK_FILTER_BLACKLIST || '').split(',')
      }
    },
    discord: {
      token: process.env.DISCORD_TOKEN,
      guild: process.env.DISCORD_GUILD,
      category: process.env.DISCORD_CATEGORY,
      sendNotifications: process.env.DISCORD_SEND_NOTIFICATIONS
    }
  }
  if (!config.discord.token || !config.facebook.username || !config.facebook.password) {
    require('./error.js')('Failed to get config information')
  }
  return config
}
