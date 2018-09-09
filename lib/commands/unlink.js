const Command = require('./Command')

module.exports = new Command({
  argc: 2,
  usage: `unlink <connection name> <ID>`,
  example: `unlink test-connection 1616656375118166`
}, (argv, reply) => reply(connections.unlink(argv[0], argv[1])))
