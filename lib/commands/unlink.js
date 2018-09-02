const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `unlink <Messenger thread ID>`,
  example: `unlink 1616656375118166`
}, (argv, reply) => reply(channels.remove(argv[0])))
