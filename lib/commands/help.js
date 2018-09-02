const Command = require('./Command')

module.exports = new Command((_, reply) => {
  reply(`Commands available:
- \`set\` - sets value in the config
- \`get\` - gets value from the config
- \`link\` - links one or more Facebook threads to a Discord channel
- \`unlink\` - removes existing link from the channel map
- \`list\` - shows existing connections
- \`showConfig\` - shows the entire config
- \`help\` - shows this message
- \`quit\` - exits Miscord`)
})
