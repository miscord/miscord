const defaultConfig = {
  messenger: {
    username: '',
    password: '',

    format: '*{username}*: {message}',
    sourceFormat: {
      discord: '(Discord)',
      messenger: '(Messenger: {name})'
    },
    ignoreEmbeds: false,
    attachmentTooLargeError: true,

    handleEvents: true,
    handlePlans: true,
    handlePolls: true,

    showPlanDetails: true,
    showPollDetails: true
  },
  discord: {
    token: '',

    guild: '',
    category: '',
    renameChannels: true,
    showFullNames: false,
    createChannels: false,

    massMentions: true,
    userMentions: true,

    ignoreBots: false,
    ignoredUsers: []
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
