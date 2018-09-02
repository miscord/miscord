const yaml = require('js-yaml')
const fs = require('fs')
const log = require('npmlog')
const { promisify } = require('util')
const { Collection } = require('discord.js')
const path = require('path')

class ConnectionsManager {
  constructor () {
    this.path = path.join(config.path, 'channels.yml')
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

    this.save()
  }

  async getChannel (id, name) {
    log.verbose('CM: getChannel', 'Looking up channel with name %s and ID %s', name, id)

    // try to get channel by id
    let channel = this.channels.get(id)
    log.silly('CM: getChannel: existing channel', channel)

    // if found, change name and return
    if (channel) return (config.discord.renameChannels && this.getThreadIDs(channel.id).length === 1) ? (channel.name === name ? channel : channel.edit({ name })) : channel

    if (!config.discord.createChannels) return log.verbose('CM: getChannel', 'Channel creation disabled, skipping.')

    // if not found, create new channel with specified name and set its parent
    channel = await discord.guilds[0].createChannel(name, 'text')
    // TODO: the code below could crash if category user provided is not in the same guild
    if (discord.category) await channel.setParent(discord.category)

    // save newly created channel in the channels map
    this.channels.set(id, channel)
    await this.save()

    log.silly('getChannel: new channel', channel)
    return channel
  }

  has (nameOrID) {
    return this.channels.find(discord => nameOrID === discord.name || nameOrID === discord.id) || this.channels.has(nameOrID)
  }

  getThreadIDs (nameOrID) {
    return this.channels.filter(discord => discord.id === nameOrID || discord.name === nameOrID).map((value, key) => key)
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
    return discord.client.channels.find(channel => channel.name === nameOrID || channel.id === nameOrID) || log.warn('CM', 'Discord channel %s has not been mapped properly', nameOrID)
  }

  add (discord, messenger) {
    const channel = this.findChannel(discord)
    if (!channel) return `Channel ${discord} not found!`
    if (typeof messenger === 'string') this.channels.set(messenger, channel)
    else messenger.forEach(threadID => this.channels.set(threadID, channel))
    this.save()
    let plural = typeof messenger !== 'string'
    return `Thread${plural ? 's' : ''} ${plural ? messenger.join(', ') : messenger} ${plural ? 'were' : 'was'} linked to #${channel.name}!`
  }

  remove (messenger) {
    this.channels.delete(messenger)
    this.save()
    return `Thread ${messenger} was removed from channel map!`
  }

  getPrintable () {
    var getFBLink = id => `[\`${id}\`](https://facebook.com/messages/t/${id})`
    let arr = []
    for (let [messenger, discord] of this.channels.entries()) {
      let otherChannels = this.channels.filter(another => another.id === discord.id).map((value, key) => key)

      messenger = otherChannels.length > 1 ? otherChannels.map(getFBLink) : getFBLink(messenger)
      discord = `<#${discord.id}>`
      arr.push(`${discord}: ${messenger}`)
    }
    return [ ...new Set(arr) ].join('\n')
  }
}

module.exports = ConnectionsManager
