import { Guild, GuildMember, Role } from 'discord.js'

export default class GuildArray extends Array<Guild> {
  getAllRoles (): Role[] {
    return this.map(guild => guild.roles.array()).flat()
  }

  getAllMembers (): GuildMember[] {
    return this.map(guild => guild.members.array()).flat()
  }
}
