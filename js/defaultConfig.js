const defaultConfig = {
  messenger: {
    username: '',
    password: '',
    whitelist: [],
    format: '',
    sourceFormat: {
      discord: '',
      messenger: ''
    },
    ignoreEmbeds: false,
    attachmentTooLargeError: true
  },
  discord: {
    token: '',
    renameChannels: true,
    showEvents: false,
    showFullNames: false,
    createChannels: false,
    massMentions: true,
    userMentions: true
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
