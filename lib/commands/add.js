const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `add <connection name>`,
  example: `add test-connection`
}, (argv, reply) => reply(connections.add(argv[0])))
