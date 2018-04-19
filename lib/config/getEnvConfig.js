module.exports = () => {
  const yn = require('yn')
  var env = process.env
  if (env.FACEBOOK_USERNAME || env.FACEBOOK_PASSWORD) require('../error')('FACEBOOK_* variables are no longer supported. Use MESSENGER_* instead.')
  var config = {
    messenger: {
      username: env.MESSENGER_USERNAME,
      password: env.MESSENGER_PASSWORD,
      forceLogin: yn(env.MESSENGER_FORCE_LOGIN),
      showUsername: yn(env.MESSENGER_SHOW_USERNAME),
      boldUsername: yn(env.MESSENGER_BOLD_USERNAME),
      filter: {
        whitelist: (env.MESSENGER_FILTER_WHITELIST || '').split(',').filter(el => el).map(el => el.trim()), // sort out empty elements and trim whitespace
        blacklist: (env.MESSENGER_FILTER_BLACKLIST || '').split(',').filter(el => el).map(el => el.trim()) // sort out empty elements and trim whitespace
      },
      separateImages: yn(env.MESSENGER_SEPARATE_IMAGES)
    },
    discord: {
      token: env.DISCORD_TOKEN,
      guild: env.DISCORD_GUILD,
      category: env.DISCORD_CATEGORY,
      renameChannels: yn(env.DISCORD_RENAME_CHANNELS),
      showEvents: yn(env.DISCORD_SHOW_EVENTS),
      showFullNames: yn(env.DISCORD_SHOW_FULL_NAMES)
    },
    checkUpdates: yn(env.MISCORD_CHECK_UPDATES),
    logLevel: env.MISCORD_LOG_LEVEL,
    custom: (env.MISCORD_CUSTOM || '').split(',').reduce((acc, el) => { if (!el) return acc; acc[el.split(':')[0].trim()] = el.split(':')[1].trim(); return acc }, {})
  }
  if (!config.discord.token || !config.messenger.username || !config.messenger.password) {
    require('../error')('Env: token/username/password missing.')
  }
  return config
}
