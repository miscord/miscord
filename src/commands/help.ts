import Command from './Command'

export default new Command(() => `Commands available:
- \`config\` - manages the config
- \`showConfig\` - shows the entire config
- \`list\` - shows existing connections

- \`info\` - shows the endpoints of a connection
- \`add\` - adds a new connection
- \`remove\` - removes a connection
- \`rename\` - renames a connection
- \`link\` - adds an endpoint to a connection
- \`unlink\` - removes an endpoint from a connection
- \`readonly\` - toggles read-only
- \`disable\` - disables an enabled connection
- \`enable\` - enables a disabled connection

- \`broadcast\` - broadcast a message to every registered connection
- \`help\` - shows this message
- \`pause\` - pauses Miscord
- \`unpause\` - unpauses Miscord
- \`restart\` - restarts Miscord
- \`quit\` - exits Miscord
- \`eval\` - ${config.enableEval
  ? 'execute JavaScript code, only for admins'
  : 'disabled, `config.enableEval = false`'
}`)
