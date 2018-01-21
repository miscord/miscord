const chalk = require('chalk')
module.exports = string => {
  console.log(chalk.red('Error: ' + string))
  process.exit(1)
}
