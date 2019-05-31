import { Collection, TextChannel } from 'discord.js'
import Connection, { Endpoint } from './Connection'
import { getThread } from './messenger'

export type YAMLConnections = { [name: string]: Endpoint[] | string }

export default class ConnectionsManager {
  list: Collection<string, Connection>
  disabled: Collection<string, Connection | string>

  constructor () {
    this.list = new Collection()
    this.disabled = new Collection()
  }

  async load () {
    const log = logger.withScope('CM:init')
    try {
      // load file and parse YAML
      let parsed = await config.loadConnections()

      if (!parsed || typeof parsed !== 'object') return this.save()

      for (let [ name, endpoints ] of Object.entries(parsed)) {
        log.trace(name, endpoints)

        if (name.startsWith('_')) {
          if (name === '__comment') continue
          if (typeof endpoints === 'string') {
            this.disabled.set(name, endpoints)
          } else {
            this.disabled.set(name, new Connection(name, endpoints))
          }
        }

        if (
          !Array.isArray(endpoints) ||
          endpoints.some(el => typeof el !== 'object')
        ) throw new Error(`Incorrect connection syntax: ${name}`)

        try {
          this.list.set(
            name,
            new Connection(
              name,
              await ConnectionsManager.validateEndpoints(endpoints)
            )
          )
        } catch (err) {
          log.warn(err.message)
          log.warn(`Disabling temporarily connection ${name}, you can re-enable it once the error is fixed.`)
          name = `_${name}`
          this.disabled.set(
            name,
            new Connection(
              name,
              endpoints
            )
          )
        }
      }
      await this.save()
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      await this.save()
    }
  }

  static async validateEndpoints (endpoints: Endpoint[]): Promise<Endpoint[]> {
    const newEndpoints: Endpoint[] = []
    for (let endpoint of (endpoints as Endpoint[])) {
      if (!endpoint.type || !endpoint.id) {
        throw new Error(`Type or ID missing on endpoint: ${JSON.stringify(endpoint)}`)
      }

      if (endpoint.type !== 'discord' && endpoint.type !== 'messenger') {
        throw new Error(`Endpoint type incorrect, should be 'messenger' or 'discord', actual: ${endpoint.type}`)
      }

      if (typeof endpoint.id !== 'string') {
        throw new Error(`Endpoint ID is not a string (wrap it in single quotes): ${endpoint.id}`)
      }

      if (endpoint.type === 'discord' && !discord.client.channels.get(endpoint.id)) {
        throw new Error(`Channel ${endpoint.id} not found!`)
      }

      if (endpoint.type === 'messenger') {
        try {
          await getThread(endpoint.id)
        } catch (err) {
          throw new Error(`Thread ${endpoint.id} not found!`)
        }
      }

      if (endpoint.name) {
        newEndpoints.push(endpoint)
        continue
      }

      endpoint.name = endpoint.type === 'discord'
        ? (discord.client.channels.get(endpoint.id) as TextChannel).name
        : (await getThread(endpoint.id)).name

      newEndpoints.push(endpoint)
    }
    return newEndpoints
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
    const yamlConnections: YAMLConnections = Object.assign(
      {
        __comment: 'This is your connections.yml file. More info at https://github.com/miscord/miscord/wiki/Connections.yml'
      },
      ...this.list.map(connection => connection.toYAMLObject()),
      ...this.disabled.map(connection => typeof connection === 'string' ? connection : connection.toYAMLObject())
    )
    return config.saveConnections(yamlConnections)
  }
}
