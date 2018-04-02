#!/usr/bin/env node

require('../lib/logger.js')
require('colors')

const minimist = require('minimist')

const sendError = require('../lib/error.js')
const login = require('../lib/login/login.js')

const discordListener = require('../lib/listeners/discord.js')
const messengerListener = require('../lib/listeners/messenger.js')
const getConfig = require('../lib/config/getConfig.js')

var args = minimist(process.argv.slice(2))

if (args.h || args.help) {
  console.log(`
Miscord v${require('../package.json').version}

Usage:

miscord --help [-h] ${'shows this message'.cyan}
miscord --version [-v] ${'shows version'.cyan}
miscord --config [-c] configPath ${'reads config from custom path'.cyan}
  `)
  process.exit(0)
}

if (args.v || args.version) {
  console.log(require('../package.json').version)
  process.exit(0)
}

getConfig(args.c || args.config).then(login).then(config => {
  // when got a discord message
  config.discord.client.on('message', message => discordListener({config, message}))

  // when got a messenger message
  config.messenger.client.listen((err, message) => messengerListener({config, err, message}))
}).catch(sendError)
