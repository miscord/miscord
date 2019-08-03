/* tslint:disable:no-empty */
import { MessageOptions, Thread, Session, User } from 'libfb'

export default class FakeClient {
  async login (username: string, password: string) {}

  getSession () { return { tokens: {}, deviceId: {} } as Session }

  async sendAttachmentFile (threadId: string, attachmentPath: string, extension?: string) {}
  async sendMessage (threadId: string, message: string, options?: MessageOptions): Promise<{
    succeeded: boolean,
    errStr?: string
  }> {
    return { succeeded: true }
  }
  async getAttachmentURL (mid: string, aid: string): Promise<string> { return '' }
  async getStickerURL (stickerID: number): Promise<string> { return '' }
  async getThreadList (count: number): Promise<Thread[]> { return [] }
  async getThreadInfo (threadID: string): Promise<Thread> { return { isGroup: true, id: threadID } as Thread }
  async getUserInfo (userID: string): Promise<User> { return { id: userID } as User }
  on (event: string, callback: any) {}

  constructor (data?: any) {}
}
