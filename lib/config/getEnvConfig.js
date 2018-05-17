module.exports = () => {
  const yn = require('yn')
  var env = process.env
  if (!env.DISCORD_TOKEN || !env.MESSENGER_USERNAME || !env.MESSENGER_PASSWORD) {
    require('../error')('Env: token/username/password missing.')
  }
  require('npmlog').warn('getEnvConfig', 'Environmental config is deprecated, as you can manually specify place where your config is.')
  require('npmlog').warn('getEnvConfig', 'New config options will *not* be added to the env config.')
  require('npmlog').warn('getEnvConfig', 'Use config file instead')
  var config = {
    messenger: {
      username: env.MESSENGER_USERNAME,
      password: env.MESSENGER_PASSWORD,
      forceLogin: yn(env.MESSENGER_FORCE_LOGIN),
      filter: {
        whitelist: (env.MESSENGER_FILTER_WHITELIST || '').split(',').filter(el => el).map(el => el.trim()), // sort out empty elements and trim whitespace
        blacklist: (env.MESSENGER_FILTER_BLACKLIST || '').split(',').filter(el => el).map(el => el.trim()) // sort out empty elements and trim whitespace
      }
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
  return config
}
