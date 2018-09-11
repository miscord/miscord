const Command = require('./Command')

module.exports = new Command((_, reply) => {
  reply(`Commands available:
- \`set\` - sets value in the config
- \`get\` - gets value from the config
- \`add\` - adds a new connection
- \`rename\` - renames an existing connection
- \`remove\` - removes an existing connection
- \`list\` - shows existing connections
- \`info\` - shows endpoints of an existing connection
- \`link\` - adds an endpoint to an existing connection
- \`unlink\` - removes an endpoint from an existing connection
- \`readonly\` - toggles read-only status
- \`showConfig\` - shows the entire config
- \`help\` - shows this message
- \`quit\` - exits Miscord`)
})
