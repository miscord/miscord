const RemoteConfig = require('./RemoteConfig')
const FileConfig = require('./FileConfig')
const Config = require('./Config')

export default async (dataPath: string = FileConfig.getConfigDir()) => {
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
