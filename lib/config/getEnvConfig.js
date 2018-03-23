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
        whitelist: (env.FACEBOOK_FILTER_WHITELIST || '').split(',').filter(el => el).map(el => el.trim()), // sort out empty elements and trim whitespace
        blacklist: (env.FACEBOOK_FILTER_BLACKLIST || '').split(',').filter(el => el).map(el => el.trim()) // sort out empty elements and trim whitespace
      }
    },
    discord: {
      token: env.DISCORD_TOKEN,
      guild: env.DISCORD_GUILD,
      category: env.DISCORD_CATEGORY,
      sendNotifications: yn(env.DISCORD_SEND_NOTIFICATIONS),
      noEmbeds: yn(env.DISCORD_NO_EMBEDS),
      renameChannels: yn(env.DISCORD_RENAME_CHANNELS)
    },
    checkUpdates: yn(env.MISCORD_CHECK_UPDATES),
    logLevel: env.MISCORD_LOG_LEVEL,
    custom: (env.MISCORD_CUSTOM || '').split(',').reduce((acc, el) => { if (!el) return acc; acc[el.split(':')[0].trim()] = el.split(':')[1].trim(); return acc }, {})
  }
  if (!config.discord.token || !config.facebook.username || !config.facebook.password) {
    require('../error.js')('Env: token/username/password missing.')
  }
  return config
}
