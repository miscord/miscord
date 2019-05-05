import chalk from 'chalk'

const fillMissingArgs = (el: Argument) => ({ ...el, args: el.args || '' })
const buildRow = ({ name, short, args, desc }: Argument) => `${chalk.yellow('--' + name)} [${chalk.magenta('-' + short)}] ${args}  ${desc}`
const equalPad = (param: 'name' | 'args') => (line: Argument, index: number, arr: Argument[]) => ({
  ...line,
  [param]: line[param]!!.padEnd(Math.max.apply(null, arr.map(el => el[param]!!.length)))
})

interface Argument {
  name: string
  short: string
  args?: string
  desc: string
  hidden?: boolean
}

const a: Argument[] = [
  {
    name: 'help',
    short: 'h',
    desc: 'shows this message'
  },
  {
    name: 'version',
    short: 'v',
    desc: 'shows version'
  },
  { name: 'dataPath',
    short: 'd',
    args: '<path>',
    desc: 'reads data from another folder'
  },
  { name: 'getPath',
    short: 'g',
    desc: 'shows default data folder path'
  },
  {
    name: 'runningWithSudoIsDangerous',
    short: 'runningWithSudoIsDangerous',
    desc: '',
    hidden: true
  }
]

export function getArgs () {
  const args = require('minimist')(process.argv.slice(2))
  let newArgs: { [key: string]: string } = {}
  a.forEach(arg => {
    if (args[arg.name] != null) newArgs[arg.name] = args[arg.name]
    if (args[arg.short] != null) newArgs[arg.name] = args[arg.short]
    if (newArgs[arg.name] != null && arg.args && typeof newArgs[arg.name] !== 'string') delete newArgs[arg.name]
  })
  return newArgs
}

export function getHelp () {
  return a
    .filter(a => !a.hidden)
    .map(equalPad('name'))
    .map(fillMissingArgs)
    .map(equalPad('args'))
    .map(buildRow)
    .join('\n  ')
}
