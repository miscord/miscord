import chalk from 'chalk'

class Argument {
  name: string
  short: string
  args: string
  desc: string

  constructor (name: string, short?: string, desc: string = '', args: string = '') {
    this.name = name
    this.short = short ?? name
    this.args = args
    this.desc = desc
  }

  buildRow (): string {
    const name = this.name.padEnd(Math.max.apply(null, b.map(arg => arg.name.length ?? 0)))
    const args = this.args.padEnd(Math.max.apply(null, b.map(arg => arg.args.length ?? 0)))

    return `${chalk.yellow('--' + name)} [${chalk.magenta('-' + this.short)}] ${args}  ${this.desc}`
  }
}

const b: Argument[] = [
  new Argument('help', 'h', 'shows this message'),
  new Argument('version', 'v', 'shows version'),
  new Argument('dataPath', 'd', 'reads data from another folder', '<path>'),
  new Argument('getPath', 'g', 'shows default data path')
]

export function getArgs (): { [key: string]: string } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const args = require('minimist')(process.argv.slice(2))
  const newArgs: { [key: string]: string } = {}
  b.forEach(arg => {
    if (args[arg.name] != null) newArgs[arg.name] = args[arg.name]
    if (args[arg.short] != null) newArgs[arg.name] = args[arg.short]

    // if argument needs to have args but it doesn't, don't put boolean there
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    if (newArgs[arg.name] != null && arg.args && typeof newArgs[arg.name] !== 'string') delete newArgs[arg.name]
  })
  return newArgs
}

export function getHelp (): string {
  logger.info('test', getArgs())
  return b
    .map(arg => arg.buildRow())
    .join('\n  ')
}
