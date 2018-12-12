const path = require('path')
const os = require('os')
const isDocker = require('is-docker')
let c

module.exports = configPath => {
  if (configPath) {
    c = configPath
    return path.parse(configPath).dir
  }
  if (c) return path.parse(c).dir
  if (isDocker()) return '/config'
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
