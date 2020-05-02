// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {
  messenger: {
    accounts: [],

    format: '*{username}*: {message}',
    sourceFormat: {
      discord: '(Discord)',
      messenger: '(Messenger: {name})'
    },
    ignoreEmbeds: false,
    attachmentTooLargeError: true,
    sendPinned: false,

    handleEvents: true,
    handlePlans: true,
    handlePolls: true,

    showPlanDetails: true,
    showPollDetails: true
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
  logLevel: process.env.MISCORD_LOG_LEVEL ?? 'info',
  ignoredSequences: [],
  channels: {},
  enableEval: false
} as { [key: string]: any }
