require('colors')

module.exports = `Miscord v${require('../package.json').version}

Usage: miscord
  --help    [-h]              ${'shows this message'.cyan}
  --version [-v]              ${'shows version'.cyan}
  --config  [-c] configPath   ${'reads config from custom path'.cyan}
  --getConfigPath             ${'shows config path'.cyan}

Example:
  miscord -c /path/to/config.json
  miscord -c D:\\Miscord\\config.json`
