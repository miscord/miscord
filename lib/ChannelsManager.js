const yaml = require('js-yaml')
const fs = require('fs')
const log = require('npmlog')
const { promisify } = require('util')
const { Collection } = require('discord.js')
const path = require('path')

class ChannelsManager {
  constructor (client) {
    this.path = path.join(config.path, 'channels.yml')
    this.client = client
    try {
      // load file and parse YAML
      let parsed = yaml.safeLoad(fs.readFileSync(this.path, 'utf8'))

      if (!parsed) throw new Error('not an error')

      // throw error when channels.yaml is empty (TODO)
      if (typeof parsed !== 'object') throw new Error('channels.yml\'s type is not "object"')

      // create Collection from these channels
      this.channels = new Collection()
      Object.entries(parsed).forEach(
        ([discord, messenger]) => {
          if (discord.startsWith('_')) return
          const channel = this.findChannel(discord)
          if (typeof messenger === 'string') return this.channels.set(messenger, channel)
          messenger.forEach(threadID => this.channels.set(threadID, channel))
        }
      )
    } catch (err) {
      if (err.message !== 'not an error' && err.code !== 'ENOENT') throw err
      this.channels = new Collection()
    }

    // map every category's channel by topic
    (config.discord.category ? config.discord.category.children : config.discord.guild.channels)
      .filter(channel => /^[0-9]+$/.test(channel.topic))
      .forEach(channel => this.channels.set(channel.topic, channel))

    Object.entries(config.custom).forEach(([messenger, discord]) => {
      this.channels.set(messenger, this.findChannel(discord))
    })

    Object.entries(config.messenger.link).forEach(([main, slaves]) => {
      if (typeof slaves === 'string') return this.channels.set(slaves, this.channels.get(main))
      slaves.forEach(id => this.channels.set(id, this.channels.get(main)))
    })

    this.channels = this.channels.filter(discord => discord)

    this.save()
  }

  async getChannel (id, name, isLinked) {
    log.verbose('CM: getChannel', 'Looking up channel with name %s and ID %s', name, id)

    // try to get channel by id
    let channel = this.channels.get(id)
    log.silly('CM: getChannel: existing channel', channel)

    // if found, change name and return
    if (channel) return (config.discord.renameChannels && !isLinked) ? (channel.name === name ? channel : channel.edit({ name })) : channel

    if (!config.discord.createChannels) return log.verbose('CM: getChannel', 'Channel creation disabled, skipping.')

    // if not found, create new channel with specified name and set its parent
    channel = await config.discord.guild.createChannel(name, 'text')
    if (config.discord.category) await channel.setParent(config.discord.category)

    // save newly created channel in the channels map
    this.channels.set(id, channel)
    await this.save()

    log.silly('getChannel: new channel', channel)
    return channel
  }

  has (nameOrID) {
    return this.channels.find(discord => nameOrID === discord.name || nameOrID === discord.id)
  }

  getThreadIDs (nameOrID) {
    return this.channels.filter(discord => discord.id === nameOrID).map((value, key) => key)
  }

  save () {
    let obj = {
      __comment: 'This is your channels.yml file. Lines beginning with "_" are created by Miscord just for readability, they\'re not needed if you\'re editing this file by hand. You can add your own comments by adding lines starting with "#"'
    }
    for (const [messenger, discord] of this.channels.entries()) {
      let otherChannels = this.channels.filter(another => another.id === discord.id).map((value, key) => key)
      obj[discord.id] = otherChannels.length > 1 ? otherChannels : messenger
      obj['_' + discord.id] = discord.name
    }
    return promisify(fs.writeFile)(this.path, yaml.safeDump(obj), 'utf8')
  }

  findChannel (nameOrID) {
    return this.client.channels.find(channel => channel.name === nameOrID || channel.id === nameOrID) || log.warn('CM', 'Discord channel %s has not been mapped properly', nameOrID)
  }
}

module.exports = ChannelsManager
