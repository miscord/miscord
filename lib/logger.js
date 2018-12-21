const path = require('path')
const util = require('util')
const getConfigDir = require('./config/getConfigDir')
const strip = require('strip-ansi')
const chalk = require('chalk')
const fs = require('fs-extra')
const gzip = require('./gzip')

const timezonedDate = formatter => {
  let date = new Date()
  date.setMinutes(date.getMinutes() + getOffset())
  return formatter(date.toJSON()).split('.')[0]
}
// https://stackoverflow.com/a/44118363
const isValidTimeZone = tz => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz })
    return true
  } catch (ex) {
    return false
  }
}
const getOffset = _ => {
  let offset = -(new Date()).getTimezoneOffset()
  if (global.config && config.timezone && isValidTimeZone(config.timezone)) {
    // https://stackoverflow.com/a/36146278
    let date = new Date()
    let arr = date.toLocaleString('ja', { timeZone: config.timezone }).split(/[/\s:]/)
    arr[1]--
    return ((Date.UTC.apply(null, arr) - new Date(date).setMilliseconds(0)) / 60 / 1000) || offset
  }
  return offset
}
const getWritableDate = () => timezonedDate(d => d.replace('T', '_').replace(/:/g, '-'))

const levelBadges = {
  fatal: chalk.bgWhite.red('  FATAL  '),
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

  getScopeForLevel (level) {
    return (this.scope || '')
      .split(':')
      .map(frag => chalk.reset(frag))
      .join(` ${levelArrows[level]} `)
  }

  inspect (object, depth = 2) {
    return util.inspect(object, { depth, colors: true, breakLength: (process.stdout.columns - 20) })
  }

  log (logLevel, msg, obj, depth) {
    if (this.level < levels[logLevel]) return
    if (typeof msg === 'object') {
      msg = [
        chalk.reset(),
        this.inspect(msg, obj || 2)
      ]
    } else {
      msg = [
        chalk.reset(msg),
        obj ? (
          (typeof obj === 'string' ? '' : '\n') + this.inspect(obj, depth || 2)
        ) : ''
      ]
    }
    console.log(
      levelBadges[logLevel],
      chalk.gray(timezonedDate(d => d.replace('T', ' '))),
      this.getScopeForLevel(logLevel),
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

module.exports.gzipOldLogs = async (configPath = getConfigDir()) => {
  let files
  try {
    files = await fs.readdir(path.join(configPath, 'logs'))
  } catch (err) {
    return
  }
  await files
    .filter(file => file.endsWith('.log'))
    .map(file => path.join(configPath, 'logs', file))
    .reduce((promise, item) => promise.then(() => gzip(item)), Promise.resolve())
}

module.exports.inject = (configPath = getConfigDir()) => {
  const dir = path.join(configPath, 'logs')
  fs.ensureDirSync(dir)

  const filename = getWritableDate() + '.log'
  const logStream = require('fs').createWriteStream(path.join(dir, filename))

  let line = ''

  // https://gist.github.com/pguillory/729616/32aa9dd5b5881f6f2719db835424a7cb96dfdfd6
  function bindWrite (write, stream) {
    return (string, encoding, fd) => {
      if (string === 'close\n') return logStream.end(() => process.exit(1))
      line += string
      if (!string.includes('\n')) return
      write.call(process[stream], line, encoding, fd)
      logStream.write(strip(line), encoding, fd)
      line = ''
    }
  }
  process.stdout.write = bindWrite(process.stdout.write, 'stdout')
  process.stderr.write = bindWrite(process.stderr.write, 'stderr')
}
