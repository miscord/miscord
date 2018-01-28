const chalk = require('chalk')
module.exports = error => {
  console.log(chalk.red('Error:'))
  console.dir(error, {colors: true})
  process.exit(1)
}
