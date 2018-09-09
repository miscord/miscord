const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `info <connection name>`,
  example: `info test-connection`
}, async (argv, reply) => reply(connections.info(argv[0])))
