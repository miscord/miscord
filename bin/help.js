const chalk = require('chalk')
const miscord = chalk.green('miscord')

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
  }
]
const args = a.map(equalPad('name')).map(fillMissingArgs).map(equalPad('args')).map(buildRow).join('\n  ')

module.exports = `${chalk.green(`Miscord v${require('../package.json').version}`)}

Usage: ${miscord}
  ${args}

Example:
  ${miscord} ${chalk.magenta('-d')} /path/to/miscord-data-folder
  ${miscord} ${chalk.magenta('-d')} D:\\Miscord`
