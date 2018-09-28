const defaultConfig = {
  messenger: {
    username: '',
    password: '',
    forceLogin: true,
    whitelist: [],
    format: '',
    sourceFormat: {
      discord: '',
      messenger: ''
    },
    ignoreEmbeds: false
  },
  discord: {
    token: '',
    renameChannels: true,
    showEvents: false,
    showFullNames: false,
    createChannels: false,
    massMentions: true
  },
  checkUpdates: false,
  logLevel: 'info',
  consoleTimestamps: false,
  logsTimestamps: true,
  timezone: ''
}

export default defaultConfig
