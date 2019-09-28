/* tslint:disable:no-empty */
import { ActivityType, Channel, ClientUser, Collection, Emoji, Guild, Presence, User } from 'discord.js'

export default class FakeClient {
  user: ClientUser = {
    id: '0',
    setActivity: async (
      name: string | null,
      options?: { url?: string, type?: ActivityType | number }
    ): Promise<Presence> => { return {} as Presence }
  } as ClientUser
  users: Collection<string, User> = new Collection()
  guilds: Collection<string, Guild> = new Collection()
  channels: Collection<string, Channel> = new Collection()
  emojis: Collection<string, Emoji> = new Collection()
  async login (token: string): Promise<string> { return token }
  on (name: string, callback: any) {}
  async destroy () {}
}
