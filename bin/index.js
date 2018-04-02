#!/usr/bin/env node

require('../lib/logger.js')
require('colors')

const sendError = require('../lib/error.js')
const login = require('../lib/login/login.js')

const discordListener = require('../lib/listeners/discord.js')
const messengerListener = require('../lib/listeners/messenger.js')
const getConfig = require('../lib/config/getConfig.js')

if (['--help', '-h'].includes(process.argv[2])) {
  console.log(
    'Miscord v' + require('../package.json').version,
    '\nUsage:',
    '\n\tmiscord', '[--help, -h]'.green, 'configPath'.blue
  )
  process.exit(1)
}

getConfig(process.argv[2]).then(login).then(config => {
  // when got a discord message
  config.discord.client.on('message', message => discordListener({config, message}))

  // when got a messenger message
  config.messenger.client.listen((err, message) => messengerListener({config, err, message}))
}).catch(sendError)
