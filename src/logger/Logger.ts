import timezonedDate from './timezonedDate'
import util from 'util'
import chalk from 'chalk'
import isDockerFn from 'is-docker'
const isDocker = isDockerFn()

export type Level = 'fatal' | 'error' | 'warn' | 'info' | 'start' | 'success' | 'debug' | 'trace'

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

  error: 1,

  warn: 2,

  info: 3,
  start: 3,
  success: 3,

  verbose: 4, // deprecated
  debug: 4,

  silly: 5, // deprecated
  trace: 5
}

export default class Logger {
  level: number
  scopedLoggers: Logger[]
  scope?: string

  constructor (level: number | Level, scope?: string) {
    this.level = typeof level === 'number' ? level : levels[level || 'info']
    this.scopedLoggers = []
    if (scope) {
      this.scope = scope
    }
  }

  withScope (scope: string): Logger {
    const logger = new Logger(this.level, this.scope ? `${this.scope}:${scope}` : scope)
    this.scopedLoggers.push(logger)
    return logger
  }

  setLevel (level: Level): void {
    this.level = levels[level]
    this.scopedLoggers.forEach(logger => logger.setLevel(level))
  }

  private getScopeForLevel (level: Level): string {
    return (this.scope ?? '')
      .split(':')
      .map(frag => chalk.reset(frag))
      .join(` ${levelArrows[level]} `)
  }

  private inspect (object: any, depth = 2, prefixLength = 20): string {
    const options = {
      depth,
      colors: true,
      breakLength: ((process.stdout.columns ?? 100) - (prefixLength + this.getScopeForLevel('info').length))
    }
    if (isDocker) delete options.breakLength
    return util.inspect(object, options)
  }

  log (logLevel: Level, msg: string, obj?: any, depth?: number): void {
    if (this.level < levels[logLevel]) return
    if (process.env.JSON_LOGS) {
      console.log(JSON.stringify({
        timestamp: new Date().toJSON(),
        name: this.scope,
        level: levels[logLevel],
        ...(typeof msg !== 'object'
          ? {
            message: msg,
            data: obj
          }
          : {
            message: '',
            data: msg
          }
        )
      }))
      return
    }
    let prefix = ''
    if (typeof msg === 'object') {
      msg = chalk.reset() + this.inspect(msg, obj)
    } else if (obj) {
      prefix = chalk.reset(msg)
      msg = obj
        ? this.inspect(obj, depth, 20 + prefix.length)
        : ''
    } else {
      msg = chalk.reset(msg)
    }
    msg = msg.split('\n').map(line =>
      [
        levelBadges[logLevel],
        chalk.gray(timezonedDate().split('T')[1]),
        this.getScopeForLevel(logLevel),
        levelArrows[logLevel],
        prefix,
        line
      ].join(' ')
    ).join('\n')
    console.log(msg)
  }

  fatal (message: string, object?: any, depth?: number): void { this.log('fatal', message, object, depth) }
  error (message: string, object?: any, depth?: number): void { this.log('error', message, object, depth) }
  info (message: string, object?: any, depth?: number): void { this.log('info', message, object, depth) }
  start (message: string, object?: any, depth?: number): void { this.log('start', message, object, depth) }
  success (message: string, object?: any, depth?: number): void { this.log('success', message, object, depth) }
  warn (message: string, object?: any, depth?: number): void { this.log('warn', message, object, depth) }
  debug (message: string, object?: any, depth?: number): void { this.log('debug', message, object, depth) }
  trace (message: string, object?: any, depth?: number): void { this.log('trace', message, object, depth) }
}
