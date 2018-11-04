#!/usr/bin/env node
require('colors')
global.logger = require('consola')
const { inspect } = require('util')
global.toStr = (object, depth = 2) => inspect(object, { depth })
const printAndExit = m => process.exit(console.log(m) || 0)

const outdated = 'Hey! Your version of Node.JS seems outdated. Minimum version required: v8.5.0, your version: ' + process.version
if (!require('semver').gte(process.version, '8.5.0')) printAndExit(outdated.yellow)

const miscord = require('../')
const sendError = require('../lib/error')
const { getConfig, getConfigDir } = require('../lib/config')
// const { checkToken } = require('../lib/discord')

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

process.on('uncaughtException', error => {
  if (!error) return
  sendError(error)
})
