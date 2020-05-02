/* eslint-disable @typescript-eslint/no-useless-constructor,@typescript-eslint/require-await,@typescript-eslint/consistent-type-assertions */
/* tslint:disable:no-empty */
import { MessageOptions, Thread, Session, User } from 'libfb'

export default class FakeClient {
  async login (username: string, password: string): Promise<void> {}

  getSession (): Session { return { tokens: {}, deviceId: {} } as Session }

  async sendAttachmentFile (threadId: string, attachmentPath: string, extension?: string): Promise<void> {}
  async sendMessage (threadId: string, message: string, options?: MessageOptions): Promise<{
    succeeded: boolean
    errStr?: string
  }> {
    return { succeeded: true }
  }

  async getAttachmentURL (mid: string, aid: string): Promise<string> { return '' }
  async getStickerURL (stickerID: number): Promise<string> { return '' }
  async getThreadList (count: number): Promise<Thread[]> { return [] }
  async getThreadInfo (threadID: string): Promise<Thread> {
    return {
      isGroup: true,
      id: threadID,
      name: threadID,
      participants: [],
      image: '',
      unreadCount: 0,
      canReply: true,
      cannotReplyReason: '',
      isArchived: false,
      color: '#000000',
      emoji: '',
      nicknames: null
    }
  }

  async getUserInfo (userID: string): Promise<User> {
    return {
      id: userID,
      name: 'Firstname Lastname',
      type: 'User',
      canMessage: true,
      emailAddresses: undefined,
      isBlocked: false,
      isMessengerUser: true,
      isPage: false,
      profilePicLarge: '',
      profilePicMedium: '',
      profilePicSmall: ''
    }
  }

  on (event: string, callback: any): void {}

  constructor (data?: any) {}
}
