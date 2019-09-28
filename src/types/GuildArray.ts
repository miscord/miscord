import { Guild } from 'discord.js'

export default class GuildArray extends Array<Guild> {
  getAll (property: 'roles' | 'members') {
    return this.map(guild => guild[property].array()).flat()
  }
}
