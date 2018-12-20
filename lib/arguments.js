const chalk = require('chalk')
const fillMissingArgs = el => ({ ...el, args: el.args || '' })
const buildRow = ({ name, short, args, desc }) => `${chalk.yellow('--' + name)} [${chalk.magenta('-' + short)}] ${args}  ${desc}`
const equalPad = param => (line, index, arr) => ({ ...line, [param]: line[param].padEnd(Math.max.apply(null, arr.map(el => el[param].length))) })
const a = [
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
    name: 'config',
    short: 'c',
    args: '<path>',
    unsupported: true
  },
  {
    name: 'runningWithSudoIsDangerous',
    short: 'runningWithSudoIsDangerous',
    hidden: true
  }
]

module.exports = {
  getArgs: () => {
    const args = require('minimist')(process.argv.slice(2))
    let newArgs = {}
    a.forEach(arg => {
      if (args[arg.name] != null) newArgs[arg.name] = args[arg.name]
      if (args[arg.short] != null) newArgs[arg.name] = args[arg.short]
      if (newArgs[arg.name] != null && arg.args && typeof newArgs[arg.name] !== 'string') delete newArgs[arg.name]
    })
    return newArgs
  },
  getHelp: () => a
    .filter(a => !a.unsupported)
    .filter(a => !a.hidden)
    .map(equalPad('name'))
    .map(fillMissingArgs)
    .map(equalPad('args'))
    .map(buildRow)
    .join('\n  ')
}
