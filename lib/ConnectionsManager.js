Object.fromMap = map => Object.assign(...map.map((v, k) => ({[k]: v})))
const yaml = require('js-yaml')
const fs = require('fs')
const log = require('npmlog')
const { promisify } = require('util')
const { Collection } = require('discord.js')
const path = require('path')
const { getThread, getChannelName } = require('./messenger')

class ConnectionsManager {
  constructor () {
    if (fs.existsSync(path.join(config.path, 'channels.yml'))) {
      fs.renameSync(path.join(config.path, 'channels.yml'), path.join(config.path, 'connections.yml'))
    }

    this.path = path.join(config.path, 'connections.yml')
  }

  async load () {
    try {
      // load file and parse YAML
      let parsed = yaml.safeLoad(fs.readFileSync(this.path, 'utf8'))

      if (!parsed) throw new Error('not an error')

      // throw error when connections.yml is empty
      if (typeof parsed !== 'object') throw new Error('connections.yml\'s type is not "object"')

      // create Collection from these channels
      this.connections = new Collection()
      await Promise.all(Object.entries(parsed).map(async ([key, value]) => {
        log.verbose('ConnectionsManager: init', 'key: %s, value: %s', key, value)
        if (typeof value === 'string' || value.some(el => typeof el === 'string')) return this.parseOldFormat(key, value)
        value = await Promise.all(value.map(async endpoint => {
          if (!endpoint.type || !endpoint.id) throw new Error('type or id missing on endpoint ' + JSON.stringify(endpoint))
          if (endpoint.name) return endpoint
          if (endpoint.type === 'discord') endpoint.name = discord.client.channels.get(endpoint.id).name
          else endpoint.name = await getChannelName(await getThread(endpoint.id), false)
          return endpoint
        }))
        this.connections.set(key, value)
      }))
      await this.save()
    } catch (err) {
      if (err.message !== 'not an error' && err.code !== 'ENOENT') throw err
      this.connections = new Collection()
      await this.save()
    }
  }

  async parseOldFormat (key, value) {
    if (key.startsWith('_')) return log.verbose('CM: parseOldFormat', 'Ignoring ', key)
    if (value === '0') return log.verbose('CM: parseOldFormat', 'Ignoring ', key)

    const connection = [ { type: 'discord', id: key, name: discord.client.channels.get(key).name } ]
    if (typeof value === 'string') connection.push({ type: 'messenger', id: value, name: await getChannelName(await getThread(value), false) })
    else await Promise.all(value.map(async threadID => connection.push({ type: 'messenger', id: threadID, name: await getChannelName(await getThread(threadID), false) })))

    log.verbose('CM: parseOldFormat', 'Migrated connection:', JSON.stringify(connection))
    return this.connections.set(discord.client.channels.get(key).name, connection)
  }

  async getChannels (id, name) {
    log.verbose('CM: getChannel', 'Looking up channel with name %s and ID %s', name, id)

    // try to get channels by id
    const channels = this.getConnection(id).filter(endpoint => endpoint.type === 'discord').map(channel => discord.client.channels.get(channel.id))
    log.silly('CM: getChannel: existing channels', channels)

    // if found
    if (channels.length) {
      // if: renaming is disabled/it's not one-to-one/name matches - return original channels
      if (!config.discord.renameChannels || this.getThreads(id).length > 1 || channels.length > 1 || channels[0].name === name) return channels
      // rename and return as array
      return [await channels[0].edit({ name })]
    }

    if (!config.discord.createChannels) return log.verbose('CM: getChannel', 'Channel creation disabled, skipping. Name: %s, id: %s', name, id) || []

    // if not found, create new channel with specified name and set its parent
    const channel = await discord.guilds[0].createChannel(name, 'text')
    // TODO: the code below could crash if category user provided is not in the same guild
    if (discord.category) await channel.setParent(discord.category)

    // save newly created channel in the channels map
    this.connections.set(name, [
      { type: 'discord', id: channel.id, name },
      { type: 'messenger', id, name }
    ])
    await this.save()

    log.silly('getChannel: new channel', channel)
    return channel
  }

  getThreads (id) {
    return this.getConnection(id).filter(endpoint => endpoint.type === 'messenger').map(endpoint => endpoint.id)
  }

  getConnection (id) {
    return this.connections.find(connection => connection.some(endpoint => endpoint.id === id)) || []
  }

  has (id) {
    return this.connections.some(connection => connection.some(endpoint => endpoint.id === id))
  }

  save () {
    let obj = {
      __comment: 'This is your connections.yml file. More info at https://github.com/miscord/miscord/wiki/Connections.yml'
    }
    if (this.connections.size) obj = Object.assign(obj, Object.fromMap(this.connections))
    return promisify(fs.writeFile)(this.path, yaml.safeDump(obj), 'utf8')
  }

  async link (name, type, id) {
    const connection = this.connections.get(name)
    if (!connection) return `Connection \`${name}\` not found!`
    if (type !== 'discord' && type !== 'messenger') return `Wrong type: ${type}! Correct types: \`discord\`, \`messenger\``
    if (type === 'discord') {
      const channel = discord.client.channels.find(channel => channel.id === id || channel.name === id)
      if (!channel) return `Discord channel \`${id}\` not found!`
      connection.push({
        type,
        id,
        name: channel.name
      })
    } else {
      const thread = await getThread(id)
      if (!thread) return `Messenger thread \`${id}\` not found!`
      connection.push({
        type,
        id,
        name: await getChannelName(thread)
      })
    }
    this.save()
    return `${type === 'discord' ? `Discord channel` : `Messenger thread`} \`${id}\` has been added successfully!`
  }

  unlink (name, id) {
    const connection = this.connections.get(name)
    if (!connection) return `Connection ${name} not found`
    this.connections.set(connection.filter(endpoint => endpoint.id !== id))
    this.save()
    return `Endpoint \`${id}\` was removed successfully from connection \`${name}\`!`
  }

  add (name) {
    if (this.connections.has(name)) return `Connection \`${name}\` already exists!`
    this.connections.set(name, [])
    this.save()
    return `Connection \`${name}\` was added successfully!`
  }

  remove (name) {
    const connection = this.connections.get(name)
    if (!connection) return `Connection \`${name}\` not found!`
    this.connections.delete(name)
    this.save()
    return `Connection \`${name}\` was removed successfully!`
  }

  print (reply) {
    let arr = []
    for (let [name] of this.connections.entries()) arr.push('`' + name + '`')
    reply({embed: {title: 'Connections:', description: arr.join('\n')}})
  }

  info (name) {
    const getFBLink = id => `[\`${id}\`](https://facebook.com/messages/t/${id})`
    const connection = this.connections.get(name)
    if (!connection) return `Connection \`${name}\` not found!`
    return { embed: {
      title: `Connection: ${name}`,
      description: `${connection.map(endpoint => `\`${endpoint.type}\`: ${endpoint.type === 'messenger' ? getFBLink(endpoint.id) : `<#${endpoint.id}>`}`).join('\n')}`
    }}
  }
}

module.exports = ConnectionsManager
