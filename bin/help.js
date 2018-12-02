const chalk = require('chalk')

module.exports = `Miscord v${require('../package.json').version}

Usage: miscord
  --help    [-h]              ${chalk.cyan('shows this message')}
  --version [-v]              ${chalk.cyan('shows version')}
  --config  [-c] configPath   ${chalk.cyan('reads config from custom path')}
  --getConfigPath             ${chalk.cyan('shows config path')}

Example:
  miscord -c /path/to/config.json
  miscord -c D:\\Miscord\\config.json`
