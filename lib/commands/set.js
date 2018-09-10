const Command = require('./Command')
const dotProp = require('dot-prop')
const saveConfig = require('../config/saveConfig')

module.exports = new Command({
  argc: 2,
  usage: `set <key> <value>`,
  example: `set discord.showEvents true`
}, (argv, reply) => {
  let [ key, value ] = argv
  if (value === 'true') value = true
  if (value === 'false') value = false
  dotProp.set(config, key, value)
  reply(`\`config.${key}\` was set to \`${value}\`.`)
  saveConfig()
})
