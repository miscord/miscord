const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `remove <connection name>`,
  example: `remove test-connection`
}, (argv, reply) => reply(connections.remove(argv[0])))
