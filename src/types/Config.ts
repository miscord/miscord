import { default as ConfigManager } from '../config/Config'

export default interface Config extends ConfigManager {
  messenger: {
    username: string
    password: string

    format: string
    sourceFormat: {
      discord: string
      messenger: string
    }
    ignoreEmbeds: boolean
    attachmentTooLargeError: boolean
    handleEvents: boolean
    handlePlans: boolean
    handlePolls: boolean
    showPlanDetails: boolean
    showPollDetails: boolean
  }
  discord: {
    token: string

    guild: string
    category: string

    renameChannels: boolean
    showFullNames: boolean
    createChannels: boolean
    massMentions: boolean
    userMentions: boolean
    ignoreBots: boolean
    ignoredUsers: string[]
  }
  api: {
    username?: string
    password?: string
    key?: string
    port?: number
  }
  channels: {
    command?: string | string[]
    error?: string | string[]
  }
  timezone: string
  checkUpdates: boolean
  logLevel: string
  ignoredSequences: any[]
}
