#!/usr/bin/env node
require('colors')
const printAndExit = m => process.exit(console.log(m) || 0)
const miscord = require('../')
const sendError = require('../lib/error')
const { getConfig, getConfigDir } = require('../lib/config')
const { checkToken } = require('../lib/discord')

var args = require('minimist')(process.argv.slice(2))
if (args.h || args.help) printAndExit(require('./help'))
if (args.v || args.version) printAndExit(require('../package.json').version)
if (args.getConfigPath) printAndExit(require('path').join(getConfigDir(), 'config.json'))

require('../lib/logger.js')(args.c || args.config)

getConfig(args.c || args.config).then(miscord).catch(err => sendError(err))

process.on('unhandledRejection', error => {
  if (!error) return
  sendError(error)
})
