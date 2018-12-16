#!/usr/bin/env node
const cluster = require('cluster')
const chalk = require('chalk')
const Logger = require('../lib/logger')
global.logger = new Logger(process.env.MISCORD_LOG_LEVEL || 'info')
const miscord = require('../')
const sendError = require('../lib/error')
const { getConfig, getConfigDir } = require('../lib/config')

const fork = d => cluster.fork({ DATA_PATH: d }).on('online', () => { lastRunTime = new Date() })

let lastRunTime

if (cluster.isMaster) {
  const printAndExit = m => process.exit(console.log(m) || 0)

  const outdated = 'Hey! Your version of Node.JS seems outdated. Minimum version required: v8.5.0, your version: ' + process.version
  if (!require('semver').gte(process.version, '8.5.0')) printAndExit(chalk.yellow(outdated))

  const args = require('../lib/arguments').getArgs()
  if (args.help) printAndExit(require('./help'))
  if (args.version) printAndExit(require('../package.json').version)
  if (args.getPath) printAndExit(require('path').join(getConfigDir(), 'config.json'))

  const configUnsupported = c => `The -c option is now deprecated.
Use --dataPath [-d] with your base folder (where your config is), probably ${require('path').parse(c).dir}.`
  if (args.config) printAndExit(chalk.yellow(configUnsupported(args.config)))

  fork(args.dataPath)

  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker process ${worker.process.pid} died.`)
    if ((new Date().getMilliseconds() - lastRunTime.getMilliseconds()) < (2 * 1000)) {
      logger.fatal('Process crashed less than 2 seconds since the last launch, exiting.')
      process.exit(1)
    }
    fork(args.dataPath)
  })
} else {
  logger.success(`Worker process ${process.pid} started.`)
  const dataPath = process.env.DATA_PATH !== 'undefined' ? process.env.DATA_PATH : undefined
  require('../lib/logger.js').inject(dataPath)
  getConfig(dataPath).then(miscord).catch(err => sendError(err))

  const catchError = error => {
    if (!error) return
    sendError(error)
  }

  process.on('unhandledRejection', catchError)
  process.on('uncaughtException', catchError)
}
