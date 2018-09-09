const Command = require('./Command')

module.exports = new Command({
  argc: 3,
  usage: `link <connection name> <type (discord/messenger)> <ID>`,
  example: `link test-connection messenger 1616656375118166`
}, async (argv, reply) => reply(await connections.link(argv[0], argv[1], argv[2])))
