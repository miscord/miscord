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
  timestamps: {
    console: false,
    logs: true
  },
  channels: {
    command: '',
    error: ''
  },
  checkUpdates: false,
  logLevel: 'info',
  timezone: ''
}

export default defaultConfig
