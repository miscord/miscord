#!/usr/bin/env node
import chalk from 'chalk'
import sudoBlock from 'sudo-block'
import cluster from 'cluster'
import Logger from '../logger/Logger'
// @ts-ignore
global.logger = new Logger(process.env.MISCORD_LOG_LEVEL || 'info')
import { getConfigDir } from '../config/FileConfig'
import launch from './worker'
import { getArgs } from '../arguments'
import help from './help'
const { version } = require('../../package.json')

const fork = (d: string) => cluster.fork({ DATA_PATH: d, ...process.env }).on('online', () => { lastRunTime = new Date() })

let lastRunTime: Date

if (cluster.isMaster) {
  const printAndExit = (m: string) => { console.log(m); process.exit(0) }

  const outdated = 'Hey! Your version of Node.JS seems outdated. Minimum version required: v8.5.0, your version: ' + process.version
  if (!require('semver').gte(process.version, '8.5.0')) printAndExit(chalk.yellow(outdated))

  const args = getArgs()
  if (args.help) printAndExit(help)
  if (args.version) printAndExit(version)
  if (args.getPath) printAndExit(getConfigDir())

  const defaultMessage = chalk`
{red.bold Miscord should not be run with root permissions.}
If running without {bold sudo} doesn't work, you can either fix your permission problems or change where npm stores global packages by putting {bold ~/npm/bin} in your PATH and running:
{blue npm config set prefix ~/npm}
See: {underline https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md}
If you {underline really} need to run Miscord with {bold sudo}, add parameter {bold --runningWithSudoIsDangerous}.
`
  if (!args.runningWithSudoIsDangerous) sudoBlock(defaultMessage)

  fork(args.dataPath)

  let loginFailed = true

  cluster.on('message', (worker, message) => {
    if (message === 'login successful') loginFailed = false
  })

  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker process ${worker.process.pid} died (${code}, ${signal}).`)
    // Code 0: exit
    // Code 1: error
    // Code 2: restart
    if ((Date.now() - lastRunTime.getTime()) < (2 * 1000)) {
      logger.fatal('Process crashed less than 2 seconds since the last launch, exiting.')
      process.exit(1)
    }
    if (code === 0) {
      logger.success('Quit signal received, exiting...')
      process.exit(0)
    }
    if (loginFailed && code === 1) {
      logger.fatal('Logging in failed, exiting.')
      process.exit(1)
    }
    loginFailed = true
    fork(args.dataPath)
  })
} else {
  launch()
}
