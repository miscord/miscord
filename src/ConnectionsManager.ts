import { Collection, TextChannel } from 'discord.js'
import Connection, { Endpoint } from './Connection'
import { getThread } from './messenger'

export type YAMLConnections = { [name: string]: Connection | string }

export class CMError extends Error {}

export default class ConnectionsManager {
  list: Collection<string, Connection>

  constructor () {
    this.list = new Collection()
  }

  async load () {
    const log = logger.withScope('CM:init')
    try {
      // load file and parse YAML
      let parsed = await config.loadConnections()

      if (!parsed || typeof parsed !== 'object') return this.save()

      // create Collection from these channels
      await Promise.all(Object.entries(parsed).map(async ([name, endpoints]) => {
        log.trace(name, endpoints)

        if (name.startsWith('_')) return

        if (
          !Array.isArray(endpoints) ||
          endpoints.some(el => typeof el !== 'object')
        ) throw new CMError(`Incorrect connection syntax: ${name}`)

        const newEndpoints: Endpoint[] = []

        for (let endpoint of (endpoints as Endpoint[])) {
          if (!endpoint.type || !endpoint.id) throw new CMError('Type or ID missing on endpoint: ' + JSON.stringify(endpoint))

          if (endpoint.type !== 'discord' && endpoint.type !== 'messenger') {
            throw new CMError(`Endpoint type incorrect, should be 'messenger' or 'discord', actual: ${endpoint.type}`)
          }

          if (typeof endpoint.id !== 'string') throw new CMError(`Endpoint ID is not a string (wrap it in single quotes): ${endpoint.id}`)

          if (endpoint.type === 'discord' && !discord.client.channels.get(endpoint.id)) throw new CMError(`Channel ${endpoint.id} not found!`)
          if (endpoint.type === 'messenger') {
            try {
              await getThread(endpoint.id)
            } catch (err) {
              throw new CMError(`Thread ${endpoint.id} not found!`)
            }
          }

          if (endpoint.name) return endpoint

          endpoint.name = endpoint.type === 'discord'
            ? (discord.client.channels.get(endpoint.id) as TextChannel).name
            : (await getThread(endpoint.id)).name

          newEndpoints.push(endpoint)
        }

        this.list.set(name, new Connection(name, newEndpoints))
      }))
      await this.save()
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      await this.save()
    }
  }

  static async createAutomaticDiscordChannel (threadID: string, name: string) {
    const log = logger.withScope('CM:createAutomaticDiscordChannel')

    // create new channel with specified name and set its parent
    const channel = await discord.guilds[0].createChannel(name, 'text')
    await channel.overwritePermissions(discord.guilds[0].roles.find(role => role.name === '@everyone').id, { VIEW_CHANNEL: false })
    log.debug(`Channel created, name: ${name}, id: ${channel.id}`)

    // set category if it's in the same guild
    if (discord.category && discord.category.guild.id === channel.guild.id) await channel.setParent(discord.category)

    // save newly created channel in the channels map
    const connection = new Connection(name)
      .addChannel({ id: channel.id, name })
      .addThread({ id: threadID.toString(), name })
    await connection.save()

    log.trace('new connection', connection, 1)
    return connection
  }

  async getWithCreateFallback (threadID: string, name: string) {
    const log = logger.withScope('CM:getWithCreateFallback')
    let connection = this.getWith(threadID)
    if (!connection) {
      if (!config.discord.createChannels) return log.debug(`Channel creation disabled, ignoring. Name: ${name}, id: ${threadID}`)
      connection = await ConnectionsManager.createAutomaticDiscordChannel(threadID, name)
    }
    return connection
  }

  getWith (id: string) {
    return this.list.find(connection => connection.has(id))
  }

  get (name: string) {
    return this.list.get(name)
  }

  has (id: string) {
    return this.list.some(connection => connection.has(id))
  }

  save () {
    let obj = {
      __comment: 'This is your connections.yml file. More info at https://github.com/miscord/miscord/wiki/Connections.yml'
    }
    if (this.list.size) {
      obj = Object.assign(obj, ...this.list.map(connection => connection.toYAMLObject()))
    }
    return config.saveConnections(obj)
  }
}
