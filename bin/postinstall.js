const chalk = require('chalk')
console.log(chalk`
Ignore any {bgYellow.black WARN} errors below/above, these are optional dependencies and they're not necessary to run Miscord correctly.
By the way, join our Discord server: {blue.underline https://discord.gg/DkmTvVz}
`) // empty line to separate from NPM warnings
