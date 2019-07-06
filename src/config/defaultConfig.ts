export default {
  messenger: {
    format: '*{username}*: {message}',
    sourceFormat: {
      discord: '(Discord)',
      messenger: '(Messenger: {name})'
    },
    ignoreEmbeds: false,
    handleEvents: true,
    handlePlans: true,
    handlePolls: true,
    showPlanDetails: true,
    showPollDetails: true,
    attachmentTooLargeError: true
  },
  discord: {
    renameChannels: true,
    showFullNames: false,
    createChannels: false,
    massMentions: false,
    userMentions: true,
    roleMentions: true,
    ignoreBots: false,
    ignoredUsers: []
  },
  checkUpdates: false,
  logLevel: process.env.MISCORD_LOG_LEVEL || 'info',
  ignoredSequences: [],
  channels: {}
} as { [key: string]: any }
