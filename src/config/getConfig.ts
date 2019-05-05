import FileConfig, { getConfigDir } from './FileConfig'
import RemoteConfig from './RemoteConfig'
import Config from './Config'

export default async (dataPath: string = getConfigDir()) => {
  const config = await getConfig(dataPath)
  config.logLevel = process.env.MISCORD_LOG_LEVEL || config.logLevel
  logger.setLevel(config.logLevel || 'info')
  // if any of the optional values is undefined, return default value
  global.config = config
}

async function getConfig (dataPath: string) {
  let config

  if (process.env.STORAGE_URL) {
    config = new RemoteConfig()
  } else {
    config = new FileConfig(dataPath)
  }

  await config.load()
  config.validate()

  return Config.proxify(config)
}
