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

  static isThread (endpoint: Endpoint) { return endpoint.type === 'messenger' }
  static isChannel (endpoint: Endpoint) { return endpoint.type === 'discord' }

  addThread (id: string) {
    this.endpoints.push({
      type: 'messenger',
      id
    })
    return this
  }

  addChannel (id: string) {
    this.endpoints.push({
      type: 'discord',
      id
    })
    return this
  }

  async addEndpoint ({ id, type, readonly }: { id: string, type: 'discord' | 'messenger', readonly?: boolean }) {
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

  has (id: string) {
    return this.endpoints.some(endpoint => endpoint.id === id)
  }

  getWritableEndpoints () { return this.endpoints.filter(endpoint => !endpoint.readonly) }

  getThreads () { return this.endpoints.filter(Connection.isThread) }
  getWritableThreads () { return this.getWritableEndpoints().filter(Connection.isThread) }
  getOtherWritableThreads (id: string) { return this.getWritableThreads().filter(thread => thread.id !== id.toString()) }

  getChannels () { return this.endpoints.filter(Connection.isChannel) }
  getWritableChannels () { return this.getWritableEndpoints().filter(Connection.isChannel) }
  getOtherWritableChannels (id: string) { return this.getWritableChannels().filter(channel => channel.id !== id) }

  async checkChannelRenames (name: string) {
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

  hasEndpoint (id: string) {
    return this.endpoints.some(endpoint => endpoint.id === id)
  }

  markEndpointAsReadonly (id: string, readonly: boolean) {
    let endpoint = this.endpoints.find(endpoint => endpoint.id === id)
    endpoint!!.readonly = readonly
    return this
  }

  removeEndpoint (id: string) {
    let index = this.endpoints.findIndex(endpoint => endpoint.id === id)
    if (index !== -1) this.endpoints.splice(index, 1)
    return this
  }

  getPrintable () {
    const getLink = ({ type, id }: { type: 'discord' | 'messenger', id: string }) => type === 'messenger'
      ? `[\`${id}\`](https://facebook.com/messages/t/${id})`
      : `<#${id}>`
    const e = (endpoint: Endpoint) => `\`${endpoint.type}\`: ${getLink(endpoint)}${endpoint.readonly ? ' (readonly)' : ''}`
    return this.endpoints.map(e).join('\n')
  }

  rename (newName: string) {
    connections.delete(this.name)
    this.name = newName
    return this
  }

  delete () {
    connections.delete(this.name)
    return connections.save()
  }

  disable () {
    if (this.disabled) return this
    this.disabled = true
    return this
  }

  enable () {
    if (!this.disabled) return this
    this.disabled = false
    return this
  }

  async save () {
    connections.set(this.name, this)
    await connections.save()
    return this
  }

  toYAMLObject () {
    return {
      [(this.disabled ? '_' : '') + this.name]: this.cleanEndpoints
    }
  }

  toObject () {
    return {
      name: this.name,
      endpoints: this.cleanEndpoints,
      disabled: this.disabled
    }
  }

  get cleanEndpoints () {
    return this.endpoints
      .map(endpoint => {
        if (!endpoint.readonly) delete endpoint.readonly
        return endpoint
      })
  }
}
