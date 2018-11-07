const path = require('path')
const util = require('util')
const getConfigDir = require('./config/getConfigDir')
const strip = require('strip-ansi')
const chalk = require('chalk')
const getDate = () => (new Date()).toJSON().replace('T', ' ').split('.')[0]
const getWritableDate = () => (new Date()).toJSON().replace('T', '_').replace(/:/g, '-').split('.')[0]
const isEnabled = type => global.config && (config[type + 'Timestamps'] != null ? config[type + 'Timestamps'] : config.timestamps[type])
const getTimestamped = (message, type) => (isEnabled(type) ? `[${getDate()}] ` : '') + message

const levelBadges = {
  fatal: chalk.bgWhite.bgRed('  FATAL  '),
  error: chalk.bgRed.white('  ERROR  '),
  warn: chalk.bgYellow.black('  WARN   '),
  info: chalk.bgBlue.black('  INFO   '),
  start: chalk.bgBlue.black('  START  '),
  success: chalk.bgGreen.black(' SUCCESS '),
  debug: chalk.bgCyan.black('  DEBUG  '),
  trace: chalk.bgWhite.black('  TRACE  ')
}

const levelArrows = {
  fatal: chalk.white('›'),
  error: chalk.red('›'),
  warn: chalk.yellow('›'),
  info: chalk.blue('›'),
  start: chalk.green('›'),
  success: chalk.green('›'),
  debug: chalk.cyan('›'),
  trace: chalk.white('›')
}

const levels = {
  silent: -1,

  fatal: 0,
  error: 0,

  warn: 1,

  info: 2,
  start: 2,
  success: 2,

  verbose: 3, // deprecated
  debug: 3,

  silly: 4, // deprecated
  trace: 4
}

class Logger {
  constructor (level, scope) {
    this.level = typeof level === 'number' ? level : levels[level] || 'info'
    if (scope) {
      this.scope = scope
    } else {
      this.scopedLoggers = []
    }
  }

  withScope (scope) {
    if (this.scope) throw new Error('Cannot create scoped logger from a scoped logger!')
    const logger = new Logger(this.level, scope)
    this.scopedLoggers.push(logger)
    return logger
  }

  setLevel (level) {
    this.level = levels[level]
    if (!this.scope) this.scopedLoggers.forEach(logger => logger.setLevel(level))
  }

  log (logLevel, msg, obj, depth) {
    if (this.level < levels[logLevel]) return
    const inspect = (msg, depth) => util.inspect(msg, { depth, colors: true, breakLength: (process.stdout.columns - 20) })
    if (typeof msg === 'object') {
      msg = [
        chalk.reset(),
        inspect(msg, obj || 2)
      ]
    } else {
      msg = [
        chalk.reset(msg),
        obj ? typeof obj === 'string' ? obj : '\n' + inspect(obj, depth || 2) : ''
      ]
    }
    console.log(
      levelBadges[logLevel],
      chalk.gray(
        new Date()
          .toISOString()
          .replace('T', ' ')
          .substr(0, 19)
      ),
      (this.scope || '')
        .split(':')
        .map(frag => chalk.reset(frag))
        .join(' ' + levelArrows[logLevel] + ' '),
      levelArrows[logLevel],
      ...msg
    )
  }

  fatal () { this.log('fatal', ...arguments) }
  error () { this.log('error', ...arguments) }
  info () { this.log('info', ...arguments) }
  start () { this.log('start', ...arguments) }
  success () { this.log('success', ...arguments) }
  warn () { this.log('warn', ...arguments) }
  debug () { this.log('debug', ...arguments) }
  trace () { this.log('trace', ...arguments) }
}

module.exports = Logger

module.exports.inject = configPath => {
  const dir = path.join(getConfigDir(configPath), 'logs')
  require('mkdirp').sync(dir, err => { throw err })

  const filename = getWritableDate() + '.log'
  const logStream = require('fs').createWriteStream(path.join(dir, filename))

  let stdoutLine = ''
  let stderrLine = ''

  // https://gist.github.com/pguillory/729616/32aa9dd5b5881f6f2719db835424a7cb96dfdfd6
  process.stdout.write = (function (write) {
    return function (string, encoding, fd) {
      if (string === 'close\n') return logStream.end(() => process.exit(1))
      stdoutLine += string
      if (!string.includes('\n')) return
      write.call(process.stdout, getTimestamped(stdoutLine, 'console'), encoding, fd)
      logStream.write(strip(getTimestamped(stdoutLine, 'logs')), encoding, fd)
      stdoutLine = ''
    }
  })(process.stdout.write)

  process.stderr.write = (function (write) {
    return function (string, encoding, fd) {
      if (string === 'close\n') return logStream.end(() => process.exit(1))
      stderrLine += string
      if (!string.includes('\n')) return
      write.call(process.stderr, getTimestamped(stderrLine, 'console'), encoding, fd)
      logStream.write(strip(getTimestamped(stderrLine, 'logs')), encoding, fd)
      stderrLine = ''
    }
  })(process.stderr.write)
}
