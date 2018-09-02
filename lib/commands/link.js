const Command = require('./Command')

module.exports = new Command({
  argc: 2,
  usage: `link <Discord channel ID or name> <Messenger thread ID> [more Messenger thread IDs]`,
  example: `link 433683136115900421 1616656375118166`,
  allowMoreArguments: true
}, (argv, reply) => reply(channels.add(argv[0], argv.length === 2 ? argv[1] : argv.slice(1))))
