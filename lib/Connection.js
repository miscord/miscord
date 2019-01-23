class Connection {
  constructor (name, endpoints = []) {
    this.name = name
    this.endpoints = endpoints.map(endpoint => {
      if (endpoint.type === 'discord' && !endpoint.channel) {
        endpoint.channel = discord.client.channels.get(endpoint.id)
      }
      return endpoint
    })
  }

  static isThread (endpoint) { return endpoint.type === 'messenger' }
  static isChannel (endpoint) { return endpoint.type === 'discord' }

  addThread ({ id, name }) {
    this.endpoints.push({
      type: 'messenger',
      id: id.toString(),
      name
    })
    return this
  }

  addChannel ({ id, name }) {
    this.endpoints.push({
      type: 'discord',
      id,
      name,
      channel: discord.client.channels.get(id)
    })
    return this
  }

  has (id) {
    return this.endpoints.some(endpoint => endpoint.id === id.toString())
  }

  getWritableEndpoints () { return this.endpoints.filter(endpoint => !endpoint.readonly) }

  getThreads () { return this.endpoints.filter(Connection.isThread) }
  getOtherThreads (id) { return this.getThreads().filter(thread => thread.id !== id.toString()) }
  getWritableThreads () { return this.getWritableEndpoints().filter(Connection.isThread) }
  getOtherWritableThreads (id) { return this.getWritableThreads().filter(thread => thread.id !== id.toString()) }

  getChannels () { return this.endpoints.filter(Connection.isChannel).filter(channel => channel.channel) }
  getOtherChannels (id) { return this.getChannels().filter(channel => channel.id !== id) }
  getWritableChannels () { return this.getWritableEndpoints().filter(Connection.isChannel).filter(channel => channel.channel) }
  getOtherWritableChannels (id) { return this.getWritableChannels().filter(channel => channel.id !== id) }

  async checkChannelRenames (name) {
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

  hasEndpoint (id) {
    return this.endpoints.some(endpoint => endpoint.id === id || endpoint.name === id)
  }

  markEndpointAsReadonly (id, readonly) {
    let endpoint = this.endpoints.find(endpoint => endpoint.id === id || endpoint.name === id)
    endpoint.readonly = readonly
    return this
  }

  removeEndpoint (id) {
    let index = this.endpoints.findIndex(endpoint => endpoint.id === id || endpoint.name === id)
    if (index) this.endpoints.splice(index, 1)
    return this
  }

  getPrintable () {
    const getLink = ({ type, id }) => type === 'messenger'
      ? `[\`${id}\`](https://facebook.com/messages/t/${id})`
      : `<#${id}>`
    const e = endpoint => `\`${endpoint.type}\`: ${getLink(endpoint)}${endpoint.readonly ? ' (readonly)' : ''}`
    return this.endpoints.map(e).join('\n')
  }

  rename (newName) {
    connections.list.remove(this.name)
    this.name = newName
    return this.save()
  }

  async save () {
    connections.list.set(this.name, this)
    await connections.save()
    return this
  }

  toObject () {
    return {
      [this.name]: this.endpoints
        .map(({ type, id, name, readonly }) => ({ type, id, name, readonly }))
        .map(endpoint => {
          if (!endpoint.readonly) delete endpoint.readonly
          return endpoint
        })
    }
  }
}

module.exports = Connection
