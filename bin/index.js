#!/usr/bin/env node
const chalk = require('chalk')
const Logger = require('../lib/logger')
global.logger = new Logger(process.env.MISCORD_LOG_LEVEL || 'info')
const printAndExit = m => process.exit(console.log(m) || 0)

const outdated = 'Hey! Your version of Node.JS seems outdated. Minimum version required: v8.5.0, your version: ' + process.version
if (!require('semver').gte(process.version, '8.5.0')) printAndExit(chalk.yellow(outdated))

const miscord = require('../')
const sendError = require('../lib/error')
const { getConfig, getConfigDir } = require('../lib/config')
// const { checkToken } = require('../lib/discord')

const args = require('minimist')(process.argv.slice(2))
if (args.h || args.help) printAndExit(require('./help'))
if (args.v || args.version) printAndExit(require('../package.json').version)
if (args.getConfigPath) printAndExit(require('path').join(getConfigDir(), 'config.json'))

require('../lib/logger.js').inject(args.c || args.config)

getConfig(args.c || args.config).then(miscord).catch(err => sendError(err))

process.on('unhandledRejection', error => {
  if (!error) return
  sendError(error)
})

process.on('uncaughtException', error => {
  if (!error) return
  sendError(error)
})
