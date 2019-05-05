import add from './add'
import broadcast from './broadcast'
import config from './config'
import eval from './eval'
import help from './help'
import info from './info'
import link from './link'
import list from './list'
import quit from './quit'
import readonly from './readonly'
import remove from './remove'
import rename from './rename'
import restart from './restart'
import showConfig from './showConfig'
import unlink from './unlink'
import Command from './Command'

const commands: { [name in CommandName]: Command } = {
  add,
  broadcast,
  config,
  eval,
  help,
  info,
  link,
  list,
  quit,
  readonly,
  remove,
  rename,
  restart,
  showConfig,
  unlink
}
export default commands
export type CommandName = (
  'add' |
  'broadcast' |
  'config' |
  'eval' |
  'help' |
  'info' |
  'link' |
  'list' |
  'quit' |
  'readonly' |
  'remove' |
  'rename' |
  'restart' |
  'showConfig' |
  'unlink'
)
