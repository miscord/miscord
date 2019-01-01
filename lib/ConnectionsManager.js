const yaml = require('js-yaml')
const fs = require('fs-extra')
const { Collection } = require('discord.js')
const path = require('path')
const { getThread } = require('./messenger')
const Connection = require('./Connection')

class ConnectionsManager {
  constructor () {
    const connectionsPath = path.join(config.path, 'connections.yml')
    const channelsPath = path.join(config.path, 'channels.yml')
    if (fs.existsSync(channelsPath) && !fs.existsSync(connectionsPath)) {
      fs.copyFileSync(channelsPath, connectionsPath)
    }

    this.path = connectionsPath
  }

  init () {
    this.list = new Collection()
    return this.save()
  }

  async load () {
    const log = logger.withScope('CM:init')
    try {
      // load file and parse YAML
      let parsed = yaml.safeLoad(fs.readFileSync(this.path, 'utf8'))

      if (!parsed || typeof parsed !== 'object') return this.init()

      // create Collection from these channels
      this.list = new Collection()
      await Promise.all(Object.entries(parsed).map(async ([name, endpoints]) => {
        log.trace(name, endpoints)
        if (typeof endpoints === 'string' || endpoints.some(el => typeof el === 'string')) return this.parseOldFormat(name, endpoints)
        endpoints = await Promise.all(endpoints.map(async endpoint => {
          if (!endpoint.type || !endpoint.id) throw new Error('type or id missing on endpoint ' + JSON.stringify(endpoint))
          if (endpoint.name) return endpoint
          endpoint.name = endpoint.type === 'discord'
            ? discord.client.channels.get(endpoint.id).name
            : (await getThread(endpoint.id)).name
          return endpoint
        }))
        this.list.set(name, new Connection(name, endpoints))
      }))
      await this.save()
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      await this.init()
    }
  }

  async parseOldFormat (key, value) {
    const log = logger.withScope('CM:parseOldFormat')
    if (key.startsWith('_') || value === '0') return log.debug(`Ignoring ${key}`)

    let name = discord.client.channels.get(key).name

    const connection = new Connection(name).addChannel({ id: key, name })
    if (typeof value === 'string') {
      connection.addThread({ id: value, name: (await getThread(value)).name })
    } else {
      for (let threadID of value) {
        connection.addThread({ id: threadID, name: (await getThread(threadID)).name })
      }
    }

    log.debug('migrated connection', connection)
    await connection.save()
  }

  async createAutomaticDiscordChannel (threadID, name) {
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

  async getWithCreateFallback (threadID, name) {
    const log = logger.withScope('CM:getWithCreateFallback')
    let connection = connections.getWith(threadID)
    if (!connection) {
      if (!config.discord.createChannels) return log.debug(`Channel creation disabled, ignoring. Name: ${name}, id: ${threadID}`)
      connection = await connections.createAutomaticDiscordChannel(threadID, name)
    }
    return connection
  }

  getWith (id) {
    return this.list.find(connection => connection.has(id))
  }

  get (name) {
    return this.list.get(name)
  }

  has (id) {
    return this.list.some(connection => connection.has(id))
  }

  save () {
    let obj = {
      __comment: 'This is your connections.yml file. More info at https://github.com/miscord/miscord/wiki/Connections.yml'
    }
    if (this.list.size) {
      obj = Object.assign(obj, ...this.list.map(connection => connection.toObject()))
    }
    return fs.writeFile(this.path, yaml.safeDump(obj), 'utf8')
  }
}

module.exports = ConnectionsManager
