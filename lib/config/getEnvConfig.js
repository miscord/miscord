module.exports = () => {
  const yn = require('yn')
  var env = process.env
  if (env.FACEBOOK_USERNAME || env.FACEBOOK_PASSWORD) require('npmlog').warn('FACEBOOK_* variables are deprecated. Use MESSENGER_* instead.')
  var config = {
    messenger: {
      username: env.MESSENGER_USERNAME || env.FACEBOOK_USERNAME /* deprecated */,
      password: env.MESSENGER_PASSWORD || env.FACEBOOK_PASSWORD /* deprecated */,
      forceLogin: yn(env.MESSENGER_FORCE_LOGIN || env.FACEBOOK_FORCE_LOGIN /* deprecated */),
      showUsername: yn(env.MESSENGER_SHOW_USERNAME || env.FACEBOOK_SHOW_USERNAME /* deprecated */),
      boldUsername: yn(env.MESSENGER_BOLD_USERNAME || env.FACEBOOK_BOLD_USERNAME /* deprecated */),
      filter: {
        whitelist: (env.MESSENGER_FILTER_WHITELIST || env.FACEBOOK_FILTER_WHITELIST /* deprecated */ || '').split(',').filter(el => el).map(el => el.trim()), // sort out empty elements and trim whitespace
        blacklist: (env.MESSENGER_FILTER_BLACKLIST || env.FACEBOOK_FILTER_BLACKLIST /* deprecated */ || '').split(',').filter(el => el).map(el => el.trim()) // sort out empty elements and trim whitespace
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
  if (!config.discord.token || !config.messenger.username || !config.messenger.password) {
    require('../error.js')('Env: token/username/password missing.')
  }
  return config
}
