import { getThread } from './messenger'
import { TextChannel } from 'discord.js'

export interface Endpoint {
  type: 'messenger' | 'discord'
  id: string
  name?: string
  channel?: TextChannel
  readonly?: boolean
}
export interface ChannelEndpoint extends Endpoint {
  channel: TextChannel
}

export default class Connection {
  name: string
  endpoints: Endpoint[]

  constructor (name: string, endpoints: Endpoint[] = []) {
    this.name = name
    this.endpoints = endpoints.map(endpoint => {
      if (endpoint.type === 'discord' && !endpoint.channel) {
        endpoint.channel = discord.client.channels.get(endpoint.id) as TextChannel
      }
      return endpoint
    })
  }

  static isThread (endpoint: Endpoint) { return endpoint.type === 'messenger' }
  static isChannel (endpoint: Endpoint) { return endpoint.type === 'discord' }

  addThread ({ id, name }: { id: string, name: string }) {
    this.endpoints.push({
      type: 'messenger',
      id: id,
      name
    })
    return this
  }

  addChannel ({ id, name }: { id: string, name: string }) {
    this.endpoints.push({
      type: 'discord',
      id,
      name,
      channel: discord.client.channels.get(id) as TextChannel
    })
    return this
  }

  async addEndpoint ({ id, type, readonly }: { id: string, type: 'discord' | 'messenger', readonly?: boolean }) {
    if (type === 'discord') {
      const channel = discord.client.channels.find(channel => channel.id === id || (channel as TextChannel).name === id)
      if (!channel) throw new Error(`Discord channel \`${id}\` not found!`)
      await this
        .addChannel({
          id: channel.id,
          name: (channel as TextChannel).name
        })
        .save()
    } else {
      let thread
      try {
        thread = await getThread(id)
      } catch (err) {
        throw new Error(`Messenger thread \`${id}\` not found!`)
      }
      await this
        .addThread({
          id,
          name: thread!!.name
        })
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

  getChannels () { return this.endpoints.filter(Connection.isChannel).filter(channel => channel.channel) as ChannelEndpoint[] }
  getWritableChannels () { return this.getWritableEndpoints().filter(Connection.isChannel).filter(channel => channel.channel) as ChannelEndpoint[] }
  getOtherWritableChannels (id: string) { return this.getWritableChannels().filter(channel => channel.id !== id) as ChannelEndpoint[] }

  async checkChannelRenames (name: string) {
    if (
      name &&
      config.discord.renameChannels &&
      this.getThreads().length === 1 &&
      this.getChannels().length === 1 &&
      !this.getChannels()[0].readonly &&
      this.getChannels()[0].name !== name
    ) {
      const channel = this.getChannels()[0]
      await channel.channel.edit({ name })
    }
    return this
  }

  hasEndpoint (id: string) {
    return this.endpoints.some(endpoint => endpoint.id === id || endpoint.name === id)
  }

  markEndpointAsReadonly (id: string, readonly: boolean) {
    let endpoint = this.endpoints.find(endpoint => endpoint.id === id || endpoint.name === id)
    endpoint!!.readonly = readonly
    return this
  }

  removeEndpoint (id: string) {
    let index = this.endpoints.findIndex(endpoint => endpoint.id === id || endpoint.name === id)
    if (index) this.endpoints.splice(index, 1)
    return this.save()
  }

  getPrintable () {
    const getLink = ({ type, id }: { type: 'discord' | 'messenger', id: string }) => type === 'messenger'
      ? `[\`${id}\`](https://facebook.com/messages/t/${id})`
      : `<#${id}>`
    const e = (endpoint: Endpoint) => `\`${endpoint.type}\`: ${getLink(endpoint)}${endpoint.readonly ? ' (readonly)' : ''}`
    return this.endpoints.map(e).join('\n')
  }

  rename (newName: string) {
    connections.list.delete(this.name)
    this.name = newName
    return this.save()
  }

  delete () {
    connections.list.delete(this.name)
    return connections.save()
  }

  async save () {
    connections.list.set(this.name, this)
    await connections.save()
    return this
  }

  toYAMLObject () {
    return {
      [this.name]: this.cleanEndpoints
    }
  }

  toObject () {
    return {
      name: this.name,
      endpoints: this.cleanEndpoints
    }
  }

  get cleanEndpoints () {
    return this.endpoints
      .map(({ type, id, name, readonly }) => ({ type, id, name, readonly }))
      .map(endpoint => {
        if (!endpoint.readonly) delete endpoint.readonly
        return endpoint
      })
  }
}
