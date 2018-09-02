const Command = require('./Command')
const dotProp = require('dot-prop')

module.exports = new Command({
  argc: 1,
  usage: `get <key>`,
  example: `get discord.showEvents`
}, (argv, reply) => {
  const key = argv[0]
  const value = dotProp.get(config, key)
  if (['discord.token', 'messenger.username', 'messenger.password'].includes(key)) return reply(`\`config.${key}\` is set to \`***\``)
  if (value == null) return reply(`config.${key} is undefined/null.`)
  reply(`\`config.${key}\` is set to \`${typeof value === 'string' ? value : JSON.stringify(value)}\``)
})
