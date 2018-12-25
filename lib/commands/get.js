const Command = require('./Command')
const dotProp = require('dot-prop')

module.exports = new Command({
  argc: 1,
  usage: `get <key>`,
  example: `get discord.showEvents`
}, argv => {
  const key = argv[0]
  const value = dotProp.get(config, key)
  if (['discord.token', 'messenger.username', 'messenger.password'].includes(key)) return `\`config.${key}\` is set to \`***\``
  if (value == null) return `config.${key} is undefined/null.`
  return `\`config.${key}\` is set to \`${typeof value === 'string' ? value : JSON.stringify(value)}\``
})
