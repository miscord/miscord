const path = require('path')
const os = require('os')

module.exports = configPath => {
  if (configPath) return path.parse(configPath).dir
  if (process.env.NODE_ENV === 'development') return '.'
  switch (process.platform) {
    case 'win32':
      return path.join(process.env.APPDATA, 'Miscord')
    case 'linux':
      return path.join(os.homedir(), '.config', 'Miscord')
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'Miscord')
    default:
      return path.join(os.homedir(), '.miscord')
  }
}
