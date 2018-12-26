const Command = require('./Command')
const dotProp = require('dot-prop')
const saveConfig = require('../config/saveConfig')

module.exports = new Command({
  argc: 2,
  usage: `set <key> <value>`,
  example: `set discord.massMentions true`,
  allowMoreArguments: true
}, argv => {
  let [ key, ...value ] = argv
  value = value.join(' ')
  if (value === 'true') value = true
  if (value === 'false') value = false
  if (/^`.+`$/.test(value)) value = eval(value.match(/^`(.+)`$/)[1]) // eslint-disable-line no-eval
  dotProp.set(config, key, value)
  saveConfig()
  return `\`config.${key}\` was set to \`${JSON.stringify(value)}\`.`
})
