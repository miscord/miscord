import { Collection } from 'discord.js'
import Connection, { Endpoint } from './Connection'
import { getThread } from './messenger'

export interface YAMLConnections { [name: string]: Endpoint[] | string }

export default class ConnectionsManager extends Collection<string, Connection> {
  async load (): Promise<void> {
    const log = logger.withScope('CM:init')
    try {
      // load file and parse YAML
      const parsed = await config.loadConnections()

      if (!parsed || typeof parsed !== 'object') return await this.save()

      for (let [ name, endpoints ] of Object.entries(parsed)) {
        log.trace(name, endpoints)

        if (name.startsWith('_')) {
          if (name === '__comment') continue
          name = name.substr(1)
          if (Array.isArray(endpoints)) {
            await new Connection(name, endpoints).disable()
          }
          continue
        }

        if (
          !Array.isArray(endpoints) ||
          endpoints.some(el => typeof el !== 'object')
        ) throw new Error(`Incorrect connection syntax: ${name}`)

        try {
          await new Connection(
            name,
            await ConnectionsManager.validateEndpoints(endpoints)
          ).save()
        } catch (err) {
          log.warn(err.message)
          log.warn(`Disabling temporarily connection ${name}, you can re-enable it once the error is fixed.`)
          await new Connection(name, endpoints).disable().save()
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
    for (const endpoint of endpoints) {
      if (!endpoint.type || !endpoint.id) {
        throw new Error(`Type or ID missing on endpoint: ${JSON.stringify(endpoint)}`)
      }

      if (endpoint.type !== 'discord' && endpoint.type !== 'messenger') {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Endpoint type incorrect, should be 'messenger' or 'discord', actual: ${endpoint.type}`)
      }

      if (typeof endpoint.id !== 'string') {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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

      newEndpoints.push(endpoint)
    }
    return newEndpoints
  }

  static async createAutomaticDiscordChannel (threadID: string, name: string): Promise<Connection> {
    const log = logger.withScope('CM:createAutomaticDiscordChannel')

    // create new channel with specified name and set its parent
    const channel = await discord.guilds[0].createChannel(name, 'text')
    await channel.overwritePermissions(discord.guilds[0].roles.find(role => role.name === '@everyone').id, { VIEW_CHANNEL: false })
    log.debug(`Channel created, name: ${name}, id: ${channel.id}`)

    // set category if it's in the same guild
    if (discord.category && discord.category.guild.id === channel.guild.id) await channel.setParent(discord.category)

    // save newly created channel in the channels map
    const connection = new Connection(name)
      .addChannel(channel.id)
      .addThread(threadID.toString())
    await connection.save()

    log.trace('new connection', connection, 1)
    return connection
  }

  async getWithCreateFallback (threadID: string, name: string): Promise<Connection | void> {
    const log = logger.withScope('CM:getWithCreateFallback')
    let connection = this.getWith(threadID)
    if (!connection) {
      if (!config.discord.createChannels) {
        log.debug(`Channel creation disabled, ignoring. Name: ${name}, id: ${threadID}`)
        return
      }
      connection = await ConnectionsManager.createAutomaticDiscordChannel(threadID, name)
    }
    return connection
  }

  getWith (id: string): Connection {
    return this.find(connection => connection.has(id))
  }

  hasWith (id: string): boolean {
    return this.some(connection => connection.has(id))
  }

  get (name: string): Connection {
    // failsafe just for TypeScript to stop complaining
    // in the code it should be checked with CM::has before
    return super.get(name) ?? new Connection(name)
  }

  hasEndpoint (id: string): boolean {
    return this.some(connection => connection.has(id))
  }

  async save (): Promise<void> {
    const yamlConnections: YAMLConnections = Object.assign(
      {
        __comment: 'This is your connections.yml file. More info at https://docs.miscord.net/configuration/connections.yml'
      },
      ...this.map(connection => connection.toYAMLObject())
    )
    return config.saveConnections(yamlConnections)
  }
}
