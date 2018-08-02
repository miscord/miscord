const log = require('npmlog')
const dotProp = require('dot-prop')
const saveConfig = require('./config/saveConfig')

const handleArgc = (argv, expectedCount, usage, example, allowMoreArguments = false) => {
  if (argv.length === expectedCount) return false
  if (argv.length > expectedCount && allowMoreArguments) return false
  config.commandChannel.send(`Too ${argv.length < expectedCount ? 'few' : 'many'} arguments!
Usage: ${usage}
Example: ${example}`)
  return true
}

const commands = {
  'set': argv => {
    if (handleArgc(argv, 2, `set <key> <value>`, `set discord.showEvents true`)) return

    const key = argv[0]
    let value = argv[1]

    if (value === 'true') value = true
    if (value === 'false') value = false
    dotProp.set(config, key, value)

    config.commandChannel.send(`\`config.${key}\` was set to \`${value}\`.`)
    saveConfig()
  },
  'get': argv => {
    if (handleArgc(argv, 1, `get <key>`, `get discord.showEvents`)) return

    const key = argv[0]
    const value = dotProp.get(config, key)

    if (value == null) return config.commandChannel.send(`config.${key} is undefined/null.`)
    config.commandChannel.send(`\`config.${key}\` is set to \`${value}\``)
  },
  'link': argv => {
    if (handleArgc(argv, 2, `link <Discord channel ID or name> <Messenger thread ID> [more Messenger thread IDs]`, `link 433683136115900421 1616656375118166`, true)) return
    config.commandChannel.send(config.channels.add(argv[0], argv.length === 2 ? argv[1] : argv.slice(1)))
  },
  'unlink': argv => {
    if (handleArgc(argv, 1, `unlink <Messenger thread ID>`, `unlink 1616656375118166`, true)) return
    config.commandChannel.send(config.channels.remove(argv[0]))
  },
  'list': argv => {
    config.commandChannel.send({embed: {description: config.channels.getPrintable()}})
  },
  'showConfig': argv => {
    config.commandChannel.send(require('fs').readFileSync(require('path').join(config.path, 'config.json')), { code: true })
  },
  'help': argv => {
    config.commandChannel.send(`Commands available:
- \`set\` - sets value in the config
- \`get\` - gets value from the config
- \`link\` - links one or more Facebook threads to a Discord channel
- \`unlink\` - removes existing link from the channel map
- \`list\` - shows existing connections
- \`showConfig\` - shows the entire config
- \`help\` - shows this message
- \`quit\` - exits Miscord`)
  },
  'quit': async _ => {
    await config.discord.client.destroy()
    log.info('logout', 'Logged out from Discord')
    process.exit(0)
  }
}

module.exports = message => {
  log.info('handleCommand', 'Command received!')
  message = message.trim()
  let command = message.trim().split(' ')[0]
  const argv = message.replace(command, '').split(' ').map(str => str.trim()).filter(str => str)
  if (!command) command = 'help'
  if (!Object.keys(commands).includes(command)) return config.commandChannel.send(`Command ${command} not found!`)
  commands[command](argv)
}
