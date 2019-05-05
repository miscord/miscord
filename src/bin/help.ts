import chalk from 'chalk'
import { getHelp } from '../arguments'
const args = getHelp()
const miscord = chalk.green('miscord')

export default `${chalk.green(`Miscord v${require('../../package.json').version}`)}

Usage: ${miscord}
  ${args}

Example:
  ${miscord} ${chalk.magenta('-d')} /path/to/miscord-data-folder
  ${miscord} ${chalk.magenta('-d')} D:\\Miscord`
