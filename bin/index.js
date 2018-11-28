#!/usr/bin/env node
const cluster = require('cluster')
const chalk = require('chalk')
const Logger = require('../lib/logger')
global.logger = new Logger(process.env.MISCORD_LOG_LEVEL || 'info')
const miscord = require('../')
const sendError = require('../lib/error')
const { getConfig, getConfigDir } = require('../lib/config')

const fork = c => cluster.fork({ CONFIG: c })

if (cluster.isMaster) {
  const printAndExit = m => process.exit(console.log(m) || 0)

  const outdated = 'Hey! Your version of Node.JS seems outdated. Minimum version required: v8.5.0, your version: ' + process.version
  if (!require('semver').gte(process.version, '8.5.0')) printAndExit(chalk.yellow(outdated))

  // const { checkToken } = require('../lib/discord')

  const args = require('minimist')(process.argv.slice(2))
  if (args.h || args.help) printAndExit(require('./help'))
  if (args.v || args.version) printAndExit(require('../package.json').version)
  if (args.getConfigPath) printAndExit(require('path').join(getConfigDir(), 'config.json'))

  fork(args.c || args.config)

  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker process ${worker.process.pid} died.`)
    fork(args.c || args.config)
  })
} else {
  logger.success(`Worker process ${process.pid} started.`)
  require('../lib/logger.js').inject(process.env.CONFIG)
  getConfig(process.env.CONFIG).then(miscord).catch(err => sendError(err))

  process.on('unhandledRejection', error => {
    if (!error) return
    sendError(error)
  })

  process.on('uncaughtException', error => {
    if (!error) return
    sendError(error)
  })
}
