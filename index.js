require('./lib/logger.js')

const sendError = require('./lib/error.js')
const login = require('./lib/login/login.js')

const discordListener = require('./lib/listeners/discord.js')
const facebookListener = require('./lib/listeners/facebook.js')

login().then(config => {
  // when got a discord message
  config.discord.client.on('message', message => discordListener({config, message}))

  // when got a facebook message
  config.facebook.client.listen((err, message) => facebookListener({config, err, message}))
}).catch(sendError)
