const defaultConfig = {
  messenger: {
    username: '',
    password: '',
    whitelist: [],
    format: '*{username}*: {message}',
    sourceFormat: {
      discord: '(Discord)',
      messenger: '(Messenger: {name})'
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
    userMentions: true,
    ignoreBots: false,
    ignoredUsers: []
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
  timezone: '',
  ignoredSequences: []
}

export default defaultConfig
