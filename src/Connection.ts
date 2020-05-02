import { getThread } from './messenger'
import { TextChannel } from 'discord.js'

export interface Endpoint {
  type: 'messenger' | 'discord'
  id: string
  readonly?: boolean
}

export default class Connection {
  name: string
  endpoints: Endpoint[]
  disabled: boolean = false

  constructor (name: string, endpoints: Endpoint[] = []) {
    this.name = name
    this.endpoints = endpoints
  }

  static isThread (endpoint: Endpoint): boolean { return endpoint.type === 'messenger' }
  static isChannel (endpoint: Endpoint): boolean { return endpoint.type === 'discord' }

  addThread (id: string): Connection {
    this.endpoints.push({
      type: 'messenger',
      id
    })
    return this
  }

  addChannel (id: string): Connection {
    this.endpoints.push({
      type: 'discord',
      id
    })
    return this
  }

  async addEndpoint ({ id, type, readonly }: { id: string, type: 'discord' | 'messenger', readonly?: boolean }): Promise<void> {
    if (type === 'discord') {
      if (!discord.client.channels.has(id)) throw new Error(`Discord channel \`${id}\` not found!`)
      await this
        .addChannel(id)
        .save()
    } else {
      try {
        await getThread(id)
      } catch (err) {
        throw new Error(`Messenger thread \`${id}\` not found!`)
      }
      await this
        .addThread(id)
        .save()
    }
    if (readonly) this.markEndpointAsReadonly(id, true)
  }

  has (id: string): boolean {
    return this.endpoints.some(endpoint => endpoint.id === id)
  }

  getWritableEndpoints (): Endpoint[] {
    return this.endpoints.filter(endpoint => !endpoint.readonly)
  }

  getThreads (): Endpoint[] { return this.endpoints.filter(Connection.isThread) }
  getWritableThreads (): Endpoint[] { return this.getWritableEndpoints().filter(Connection.isThread) }
  getOtherWritableThreads (id: string): Endpoint[] { return this.getWritableThreads().filter(thread => thread.id !== id.toString()) }

  getChannels (): Endpoint[] { return this.endpoints.filter(Connection.isChannel) }
  getWritableChannels (): Endpoint[] { return this.getWritableEndpoints().filter(Connection.isChannel) }
  getOtherWritableChannels (id: string): Endpoint[] { return this.getWritableChannels().filter(channel => channel.id !== id) }

  async checkChannelRenames (name: string): Promise<Connection> {
    if (
      !name ||
      !config.discord.renameChannels ||
      this.getThreads().length !== 1 ||
      this.getChannels().length !== 1
    ) return this

    const channel = discord.client.channels.get(this.getChannels()[0].id)
    if (
      !channel ||
      !(channel instanceof TextChannel) ||
      name === channel.name
    ) return this

    await channel.edit({ name })

    return this
  }

  hasEndpoint (id: string): boolean {
    return this.endpoints.some(endpoint => endpoint.id === id)
  }

  markEndpointAsReadonly (id: string, readonly: boolean): Connection {
    const endpoint = this.endpoints.find(endpoint => endpoint.id === id)
    if (endpoint != null) endpoint.readonly = readonly
    return this
  }

  removeEndpoint (id: string): Connection {
    const index = this.endpoints.findIndex(endpoint => endpoint.id === id)
    if (index !== -1) this.endpoints.splice(index, 1)
    return this
  }

  getPrintable (): string {
    return this.endpoints.map(endpoint => {
      const link = endpoint.type === 'messenger'
        ? `[\`${endpoint.id}\`](https://facebook.com/messages/t/${endpoint.id})`
        : `<#${endpoint.id}>`

      return `\`${endpoint.type}\`: ${link}${endpoint.readonly ? ' (readonly)' : ''}`
    }).join('\n')
  }

  rename (newName: string): Connection {
    connections.delete(this.name)
    this.name = newName
    return this
  }

  async delete (): Promise<void> {
    connections.delete(this.name)
    return connections.save()
  }

  disable (): Connection {
    if (this.disabled) return this
    this.disabled = true
    return this
  }

  enable (): Connection {
    if (!this.disabled) return this
    this.disabled = false
    return this
  }

  async save (): Promise<Connection> {
    connections.set(this.name, this)
    await connections.save()
    return this
  }

  toYAMLObject (): any {
    return {
      [(this.disabled ? '_' : '') + this.name]: this.cleanEndpoints
    }
  }

  toObject (): any {
    return {
      name: this.name,
      endpoints: this.cleanEndpoints,
      disabled: this.disabled
    }
  }

  get cleanEndpoints (): Endpoint[] {
    return this.endpoints
      .map(endpoint => {
        if (!endpoint.readonly) delete endpoint.readonly
        return endpoint
      })
  }
}
