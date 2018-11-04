Object.fromMap = map => Object.assign(...map.map((v, k) => ({ [k]: v })))
const yaml = require('js-yaml')
const fs = require('fs')
const { promisify } = require('util')
const { Collection } = require('discord.js')
const path = require('path')
const { getThread, getChannelName } = require('./messenger')

class ConnectionsManager {
  constructor () {
    const connectionsPath = path.join(config.path, 'connections.yml')
    const channelsPath = path.join(config.path, 'channels.yml')
    if (fs.existsSync(channelsPath) && !fs.existsSync(connectionsPath)) {
      fs.copyFileSync(channelsPath, connectionsPath)
    }

    this.path = connectionsPath
  }

  async load () {
    const log = logger.withScope('CM:init')
    try {
      // load file and parse YAML
      let parsed = yaml.safeLoad(fs.readFileSync(this.path, 'utf8'))

      if (!parsed) throw new Error('not an error')

      // throw error when connections.yml is empty
      if (typeof parsed !== 'object') throw new Error('connections.yml\'s type is not "object"')

      // create Collection from these channels
      this.list = new Collection()
      await Promise.all(Object.entries(parsed).map(async ([key, value]) => {
        log.trace(key, value)
        if (typeof value === 'string' || value.some(el => typeof el === 'string')) return this.parseOldFormat(key, value)
        value = await Promise.all(value.map(async endpoint => {
          if (!endpoint.type || !endpoint.id) throw new Error('type or id missing on endpoint ' + JSON.stringify(endpoint))
          if (endpoint.name) return endpoint
          if (endpoint.type === 'discord') endpoint.name = discord.client.channels.get(endpoint.id).name
          else endpoint.name = await getChannelName(await getThread(endpoint.id), false)
          return endpoint
        }))
        this.list.set(key, value)
      }))
      await this.save()
    } catch (err) {
      if (err.message !== 'not an error' && err.code !== 'ENOENT') throw err
      this.list = new Collection()
      await this.save()
    }
  }

  async parseOldFormat (key, value) {
    const log = logger.withScope('CM:parseOldFormat')
    if (key.startsWith('_') || value === '0') return log.debug(`Ignoring ${key}`)

    const connection = [ { type: 'discord', id: key, name: discord.client.channels.get(key).name } ]
    if (typeof value === 'string') connection.push({ type: 'messenger', id: value, name: await getChannelName(await getThread(value), false) })
    else await Promise.all(value.map(async threadID => connection.push({ type: 'messenger', id: threadID, name: await getChannelName(await getThread(threadID), false) })))

    log.debug('migrated connection', JSON.stringify(connection))
    return this.list.set(discord.client.channels.get(key).name, connection)
  }

  async getChannels (id, name) {
    const log = logger.withScope('CM:getChannel')
    log.debug(`Looking up channel with name ${name} and ID ${id}`)

    // try to get channels by id
    const channels = this.getConnection(id)
      .filter(endpoint => endpoint.type === 'discord')
      .map(channel => { let c = discord.client.channels.get(channel.id); c.readonly = channel.readonly; return c })
    log.trace('existing channels', channels)

    // if found
    if (channels.length) {
      // if: renaming is disabled/it's not one-to-one/name matches - return original channels
      if (!config.discord.renameChannels || this.getThreads(id).length > 1 || channels.length > 1 || channels[0].name === name) return channels.filter(el => !el.readonly)
      // rename and return as array
      return [await channels[0].edit({ name })].filter(el => !el.readonly)
    }

    if (!config.discord.createChannels) return log.debug(`Channel creation disabled, skipping. Name: ${name}, id: ${id}`) || []

    // if not found, create new channel with specified name and set its parent
    const channel = await discord.guilds[0].createChannel(name, 'text')
    await channel.overwritePermissions(discord.guilds[0].roles.find(role => role.name === '@everyone').id, { VIEW_CHANNEL: false })
    log.debug(`Channel created, name: ${name}, id: ${channel.id}`)
    // TODO: the code below could crash if category user provided is not in the same guild
    if (discord.category) await channel.setParent(discord.category)

    // save newly created channel in the channels map
    this.list.set(name, [
      { type: 'discord', id: channel.id, name },
      { type: 'messenger', id: id.toString(), name }
    ])
    await this.save()

    log.trace('new channel', channel)
    return [ channel ]
  }

  getThreads (id) {
    return this.getConnection(id).filter(endpoint => endpoint.type === 'messenger')
  }

  getConnection (id) {
    return this.list.find(connection => connection.some(endpoint => endpoint.id === id.toString())) || []
  }

  has (id) {
    return this.list.some(connection => connection.some(endpoint => endpoint.id === id.toString()))
  }

  save () {
    let obj = {
      __comment: 'This is your connections.yml file. More info at https://github.com/miscord/miscord/wiki/Connections.yml'
    }
    if (this.list.size) obj = Object.assign(obj, Object.fromMap(this.list))
    return promisify(fs.writeFile)(this.path, yaml.safeDump(obj), 'utf8')
  }
}

module.exports = ConnectionsManager
