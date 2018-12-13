const chalk = require('chalk')
const args = require('../lib/arguments').getHelp()
const miscord = chalk.green('miscord')

module.exports = `${chalk.green(`Miscord v${require('../package.json').version}`)}

Usage: ${miscord}
  ${args}

Example:
  ${miscord} ${chalk.magenta('-d')} /path/to/miscord-data-folder
  ${miscord} ${chalk.magenta('-d')} D:\\Miscord`
